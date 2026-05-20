const Puja = require('../models/Puja');

// @desc    Get all active pujas (with optional category and search filter)
// @route   GET /api/pujas
// @access  Public
exports.getPujas = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const pujas = await Puja.find(filter).sort({ rating: -1 });
    res.status(200).json({ success: true, count: pujas.length, data: pujas });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single puja by ID
// @route   GET /api/pujas/:id
// @access  Public
exports.getPujaById = async (req, res, next) => {
  try {
    const puja = await Puja.findById(req.params.id);
    if (!puja) {
      return res.status(404).json({ success: false, message: 'Puja not found' });
    }
    res.status(200).json({ success: true, data: puja });
  } catch (err) {
    next(err);
  }
};
