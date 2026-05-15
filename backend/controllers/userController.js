const User = require('../models/User');

// @desc    Upload/Update Profile Picture
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileUrl = req.file.path; // Cloudinary URL
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: fileUrl },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: user, avatarUrl: fileUrl });
  } catch (err) {
    next(err);
  }
};
