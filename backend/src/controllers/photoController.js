const cloudinary = require('cloudinary').v2;
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

    const uploadedPhotos = [];

    for (const file of req.files) {
      // 1. Convert multer buffer to canvas Image
      const img = await canvas.loadImage(file.buffer);

      // 2. Detect faces and descriptors
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections && detections.length > 0) {
        // 3. Upload image to Cloudinary
        const cloudResult = await uploadToCloudinary(file.buffer, file.originalname);

        // 4. Save to MongoDB for each detected face descriptor
        // Alternatively, save the photo once with all descriptors?
        // Wait, the prompt says `faceDescriptor: [Number]`. We can store one document per face, or change it to array of arrays.
        // If we store one document per face, it's easier to search.
        for (const detection of detections) {
           const photo = await Photo.create({
             user: req.user._id,
             imageUrl: cloudResult.secure_url,
             publicId: cloudResult.public_id,
             faceDescriptor: Array.from(detection.descriptor) // Convert Float32Array to standard array
           });
           uploadedPhotos.push(photo);
        }
      }
    }

    res.status(200).json({
      message: 'Photos uploaded and processed successfully',
      photos: uploadedPhotos
    });

  } catch (err) {
    console.error('Error uploading photos:', err);
    res.status(500).json({ error: 'Failed to upload photos' });
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

    // 1. Convert multer buffer to canvas Image
    const img = await canvas.loadImage(req.file.buffer);

    // 2. Detect face in the uploaded selfie
    const detection = await faceapi.detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return res.status(400).json({ error: 'No face detected in the selfie. Please try again with a clearer photo.' });
    }

    // 3. Fetch ONLY the logged-in user's photos from MongoDB
    const userPhotos = await Photo.find({ user: req.user._id });

    if (userPhotos.length === 0) {
      return res.status(200).json({ matches: [] }); // No photos to search against
    }

    const matchedImageUrls = new Set();
    const selfieDescriptor = detection.descriptor;

    // 4. Compare selfie descriptor with stored photo descriptors
    for (const photo of userPhotos) {
      const storedDescriptor = new Float32Array(photo.faceDescriptor);
      const distance = faceapi.euclideanDistance(selfieDescriptor, storedDescriptor);
      
      // Use a distance threshold like 0.45 to 0.6
      if (distance <= 0.55) {
        matchedImageUrls.add(photo.imageUrl);
      }
    }

    res.status(200).json({ matches: Array.from(matchedImageUrls) });

  } catch (err) {
    console.error('Error in /api/photos/search:', err);
    res.status(500).json({ error: 'Failed to search photos' });
  }
};

// @desc    Get user's uploaded gallery photos
// @route   GET /api/photos
// @access  Private
const getPhotos = async (req, res) => {
  try {
    // Return unique photos for the user
    const photos = await Photo.find({ user: req.user._id }).select('imageUrl publicId createdAt');
    
    // Deduplicate by imageUrl since multiple faces might be in one photo
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
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to read gallery.' });
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
