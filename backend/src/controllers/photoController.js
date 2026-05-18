const cloudinary = require('cloudinary').v2;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require('../models/Photo');
const canvas = require('canvas');
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');

// Helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'wedding_gallery', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Upload multiple photos
// @route   POST /api/photos/upload
// @access  Private
const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`[Upload] Processing ${req.files.length} files for user ${req.user._id}`);
    const uploadedPhotos = [];
    const errors = [];

    // Process files in small chunks to prevent memory spikes and event loop blocking
    const CHUNK_SIZE = 2; 
    for (let i = 0; i < req.files.length; i += CHUNK_SIZE) {
      const chunk = req.files.slice(i, i + CHUNK_SIZE);
      
      await Promise.all(chunk.map(async (file) => {
        try {
          // 1. Convert multer buffer to canvas Image
          const img = await canvas.loadImage(file.buffer);

          // 2. Detect faces and descriptors
          // Using a slightly more efficient detection configuration
          const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

          if (detections && detections.length > 0) {
            // 3. Upload image to Cloudinary
            const cloudResult = await uploadToCloudinary(file.buffer, file.originalname);

            // 4. Batch save to MongoDB
            const photoData = detections.map(detection => ({
              user: req.user._id,
              imageUrl: cloudResult.secure_url,
              publicId: cloudResult.public_id,
              faceDescriptor: Array.from(detection.descriptor)
            }));
            
            const savedPhotos = await Photo.insertMany(photoData);
            uploadedPhotos.push(...savedPhotos);
          } else {
            errors.push({ file: file.originalname, error: 'No face detected' });
          }
          
          // Manually hint GC if possible, or at least clear local refs
          // img = null; 
        } catch (fileError) {
          console.error(`[Upload] Error processing ${file.originalname}:`, fileError.message);
          errors.push({ file: file.originalname, error: 'Processing failed' });
        }
      }));

      // Small delay between chunks to allow event loop to breathe and GC to work
      if (i + CHUNK_SIZE < req.files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    res.status(200).json({
      message: uploadedPhotos.length > 0 ? 'Upload complete' : 'Upload failed',
      count: uploadedPhotos.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('[Upload] Critical error:', err);
    res.status(500).json({ error: 'Internal server error during processing' });
  }
};

// @desc    Search matching photos using selfie
// @route   POST /api/photos/search
// @access  Private
const searchPhotos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No selfie image uploaded.' });
    }

    const img = await canvas.loadImage(req.file.buffer);
    const detection = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return res.status(400).json({ error: 'No face detected in the selfie.' });
    }

    // Optimization: Use lean() and select only needed fields
    const userPhotos = await Photo.find({ user: req.user._id })
      .select('imageUrl faceDescriptor')
      .lean();

    if (userPhotos.length === 0) {
      return res.status(200).json({ matches: [] });
    }

    const matchedImageUrls = new Set();
    const selfieDescriptor = detection.descriptor;

    // Use a more aggressive distance threshold for production accuracy
    const THRESHOLD = 0.55;

    for (const photo of userPhotos) {
      const storedDescriptor = new Float32Array(photo.faceDescriptor);
      const distance = faceapi.euclideanDistance(selfieDescriptor, storedDescriptor);
      
      if (distance <= THRESHOLD) {
        matchedImageUrls.add(photo.imageUrl);
      }
    }

    res.status(200).json({ matches: Array.from(matchedImageUrls) });

  } catch (err) {
    console.error('[Search] Error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

// @desc    Get user's uploaded gallery photos
// @route   GET /api/photos
// @access  Private
const getPhotos = async (req, res) => {
  try {
    // Return unique photos for the user, optimized with lean() and projection
    const photos = await Photo.find({ user: req.user._id })
      .select('imageUrl publicId createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Deduplicate by imageUrl efficiently
    const uniquePhotos = [];
    const urlSet = new Set();
    for (const photo of photos) {
      if (!urlSet.has(photo.imageUrl)) {
        urlSet.add(photo.imageUrl);
        uniquePhotos.push(photo);
      }
    }

    res.status(200).json({ images: uniquePhotos });
  } catch (err) {
    console.error('[Gallery] Error:', err);
    res.status(500).json({ error: 'Failed to load gallery' });
  }
};

// @desc    Delete a photo by publicId
// @route   DELETE /api/photos/:publicId
// @access  Private
const deletePhoto = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Check if photo belongs to user
    const photos = await Photo.find({ publicId, user: req.user._id });
    
    if (photos.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete all records with this publicId from DB
    await Photo.deleteMany({ publicId, user: req.user._id });

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

module.exports = {
  uploadPhotos,
  searchPhotos,
  getPhotos,
  deletePhoto
};
