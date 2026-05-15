const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'panditji/chat',
    resource_type: 'auto', // Allows images, videos, audio
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg']
  }
});

const chatUpload = multer({
  storage: storage,
  limits: { fileSize: 20000000 } // 20MB limit
});

module.exports = chatUpload;
