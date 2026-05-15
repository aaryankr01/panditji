const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'panditji/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 } // 5MB limit
});

module.exports = upload;
