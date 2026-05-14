const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  faceDescriptor: {
    type: [Number], // Array of numbers to store Float32Array face descriptors
    required: true,
  },
}, {
  timestamps: true,
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
