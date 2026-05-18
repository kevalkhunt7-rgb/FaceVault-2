const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Use memory storage to get buffer for face-api processing
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per image
    files: 50, // max 50 files
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const isValid = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

module.exports = upload;