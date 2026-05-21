const User = require('../models/User');
const Pandit = require('../models/Pandit');

// @desc    Get all active pandits (with optional city filter)
// @route   GET /api/pandits?city=Mumbai
// @access  Public
exports.getPandits = async (req, res, next) => {
  try {
    const { city, lat, lng } = req.query;

    // Geographic search based on coordinates
    if (lat && lng) {
      const pandits = await Pandit.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: 'distance',
            spherical: true,
            // Convert distance from meters to km
            distanceMultiplier: 0.001
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        { $match: { 
            'userDetails.isActive': true, 
            'userDetails.role': 'pandit'
        } }
      ]);

      // Map back to expected format
      const formattedPandits = pandits.map(p => {
        const user = p.userDetails;
        delete p.userDetails;
        // attach distance to the pandit object so UI can use it
        return { ...user, distance: p.distance, panditProfile: p };
      });

      return res.status(200).json({
        success: true,
        count: formattedPandits.length,
        data: formattedPandits,
        isLocal: true,
        message: `Found ${formattedPandits.length} pandit(s) near your location`
      });
    }

    // If city is provided, first try to find pandits in that city
    if (city) {
      const localPanditProfiles = await Pandit.find({
      }).populate({
        path: 'user',
        match: {
          role: 'pandit',
          isActive: true,
          city: { $regex: new RegExp(`^${city}$`, 'i') }
        },
        select: '-password'
      });

      const localPandits = localPanditProfiles
        .filter(p => p.user !== null)
        .map(p => {
          const u = p.user.toObject();
          p.user = undefined;
          return { ...u, panditProfile: p };
        });

      if (localPandits.length > 0) {
        return res.status(200).json({
          success: true,
          count: localPandits.length,
          data: localPandits,
          isLocal: true,
          message: `Found ${localPandits.length} pandit(s) in ${city}`
        });
      }

      // No local pandits — return top pandits from major cities, sorted newest first
      const fallbackProfiles = await Pandit.find({
      }).populate({
        path: 'user',
        match: { role: 'pandit', isActive: true },
        select: '-password'
      }).sort({ createdAt: -1 }).limit(12);

      const fallbackPandits = fallbackProfiles
        .filter(p => p.user !== null)
        .map(p => {
          const u = p.user.toObject();
          p.user = undefined;
          return { ...u, panditProfile: p };
        });

      return res.status(200).json({
        success: true,
        count: fallbackPandits.length,
        data: fallbackPandits,
        isLocal: false,
        message: `No pandits available in ${city}. Showing trusted pandits from nearby cities.`
      });
    }

    // No city filter — return all pandits sorted newest first
    const allProfiles = await Pandit.find({
    }).populate({
      path: 'user',
      match: { role: 'pandit', isActive: true },
      select: '-password'
    }).sort({ createdAt: -1 });

    const pandits = allProfiles
      .filter(p => p.user !== null)
      .map(p => {
        const u = p.user.toObject();
        p.user = undefined;
        return { ...u, panditProfile: p };
      });

    res.status(200).json({ success: true, count: pandits.length, data: pandits, isLocal: true, message: `Found ${pandits.length} pandit(s)` });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single pandit profile
// @route   GET /api/pandits/:id
// @access  Public
exports.getPandit = async (req, res, next) => {
  try {
    const pandit = await User.findById(req.params.id)
      .populate('panditProfile')
      .select('-password');

    if (!pandit || pandit.role !== 'pandit') {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }

    res.status(200).json({ success: true, data: pandit });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in pandit profile
// @route   GET /api/pandits/my-profile
// @access  Private/Pandit
exports.getMyProfile = async (req, res, next) => {
  try {
    const pandit = await User.findById(req.user.id).populate('panditProfile');
    res.status(200).json({ success: true, data: pandit });
  } catch (err) {
    next(err);
  }
};

// @desc    Update pandit profile
// @route   PATCH /api/pandits/profile
// @access  Private/Pandit
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, city, specializations, experience, bio, feePerPuja } = req.body;
    
    // Update user details
    const userUpdates = {};
    if (firstName) userUpdates.firstName = firstName;
    if (lastName) userUpdates.lastName = lastName;
    if (phone) userUpdates.phone = phone;
    if (city) userUpdates.city = city;

    const user = await User.findByIdAndUpdate(req.user.id, userUpdates, { new: true, runValidators: true });

    // Update pandit profile details
    if (user.panditProfile) {
      const panditUpdates = {};
      if (specializations) panditUpdates.specializations = specializations;
      if (experience !== undefined) panditUpdates.experience = experience;
      if (bio) panditUpdates.bio = bio;
      if (feePerPuja !== undefined) panditUpdates.feePerPuja = feePerPuja;

      await Pandit.findByIdAndUpdate(user.panditProfile, panditUpdates, { new: true, runValidators: true });
    }

    const updatedUser = await User.findById(req.user.id).populate('panditProfile');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Aadhar document for verification
// @route   POST /api/pandits/aadhar/upload
// @access  Private/Pandit
exports.uploadAadharDocument = async (req, res, next) => {
  try {
    const { aadharNumber } = req.body;

    if (!aadharNumber || aadharNumber.length !== 12) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 12-digit Aadhar number' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Aadhar card image' });
    }

    const user = await User.findById(req.user.id);
    if (!user.panditProfile) {
      return res.status(400).json({ success: false, message: 'Pandit profile not found' });
    }

    // Save document URL (from Cloudinary) and mark for review
    await Pandit.findByIdAndUpdate(user.panditProfile, {
      aadharNumber,
      isAadharVerified: false, // Pending admin review
      isApproved: false, // Hidden until verified
      $push: { documents: req.file.path } // Add to documents array
    });

    const updatedUser = await User.findById(req.user.id).populate('panditProfile');

    res.status(200).json({ 
      success: true, 
      message: 'Aadhar document uploaded successfully. Please wait 24 hours for admin verification.',
      data: updatedUser 
    });
  } catch (err) {
    next(err);
  }
};
