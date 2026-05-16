const User = require('../models/User');
const Admin = require('../models/Admin');
const Pandit = require('../models/Pandit');

// @desc    Register a user (Devotee or Pandit)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role, city, state, panditSpecialization, panditExperience } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create User first without panditProfile
    user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      city,
      state
    });

    if (role === 'pandit') {
      try {
        const panditProfile = await Pandit.create({
          user: user._id,
          city: city, 
          state: state || '',
          specializations: ['All Pujas'], 
          bio: `Specializes in: ${panditSpecialization || 'Vedic Rituals'}`, 
          experience: parseInt(panditExperience) || 0,
          feePerPuja: 1500, // Explicitly pass the default
          subscription: { isActive: false }
        });
        
        // Link back to user
        user.panditProfile = panditProfile._id;
        await user.save();
      } catch (profileErr) {
        // If profile creation fails, we should ideally delete the user but for now let's just throw
        console.error('Pandit Profile Creation Error:', profileErr);
        // Delete the user so they can try again
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          success: false, 
          message: profileErr.message || 'Failed to create pandit profile. Please check all fields.' 
        });
      }
    }

    const token = user.getJWT();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        city: user.city
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.getJWT();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        city: user.city
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = admin.getJWT();

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user/admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id);
      return res.status(200).json({ success: true, data: admin });
    }
    
    const user = await User.findById(req.user.id).populate('panditProfile');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
