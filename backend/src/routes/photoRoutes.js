const express = require('express');
const router = express.Router();
const {
  uploadPhotos,
  searchPhotos,
  getPhotos,
  deletePhoto,
} = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getPhotos);

router.post('/upload', protect, upload.array('photos', 20), uploadPhotos);
router.post('/search', protect, upload.single('selfie'), searchPhotos);
router.delete('/:publicId', protect, deletePhoto);

module.exports = router;
