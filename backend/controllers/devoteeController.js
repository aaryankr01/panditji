const User = require('../models/User');

// @desc    Get logged in devotee profile
// @route   GET /api/devotees/my-profile
// @access  Private/Devotee
exports.getMyProfile = async (req, res, next) => {
  try {
    const devotee = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: devotee });
  } catch (err) {
    next(err);
  }
};

// @desc    Update devotee profile
// @route   PATCH /api/devotees/profile
// @access  Private/Devotee
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, city, state, phone, alternatePhone, pinnedLocation } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { firstName, lastName, city, state, phone, alternatePhone, pinnedLocation }, 
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
