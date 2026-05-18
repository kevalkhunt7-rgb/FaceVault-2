require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const connectCloudinary = require('./src/config/cloudinary');

// Polyfills for face-api.js in Node.js environment
const canvas = require('canvas');
const fetch = require('node-fetch');
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
global.util = util;
global.fetch = fetch;
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');

// Patch node environment
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database and cloudinary
connectDB();
connectCloudinary();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://face-vault-2.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const MODEL_DIR = path.join(__dirname, 'models');

// Initialize models
async function initFaceAPI() {
  console.log('Loading face-api models...');
  
  if (faceapi.tf) {
    await faceapi.tf.setBackend('wasm');
    await faceapi.tf.ready();
  }
  
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_DIR);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_DIR);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_DIR);
  console.log('Models loaded successfully.');
}

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/photos', require('./src/routes/photoRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 20 allowed at once.' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'One or more files are too large. Maximum 10MB per file.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await initFaceAPI();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    server.on('close', () => {
      console.log('Server closed');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
