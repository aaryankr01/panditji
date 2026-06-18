const Temple = require('../models/Temple');
const TempleOrder = require('../models/TempleOrder');
const User = require('../models/User');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────
// PUBLIC / DEVOTEE ROUTES
// ─────────────────────────────────────────────────────────────

// @desc   Get all active temples
// @route  GET /api/temple
// @access Public
exports.getTemples = async (req, res, next) => {
  try {
    const temples = await Temple.find({ isActive: true }).sort('name');
    res.json({ success: true, data: temples });
  } catch (err) { next(err); }
};

// @desc   Place a Chadava (monetary donation) order
// @route  POST /api/temple/chadava
// @access Private/Devotee
exports.createChadavaOrder = async (req, res, next) => {
  try {
    const { templeId, amount, dedicatedTo } = req.body;
    const devoteeId = req.user.id;

    if (!templeId || !amount || amount < 1) {
      return res.status(400).json({ success: false, message: 'Temple and a valid amount are required' });
    }

    const temple = await Temple.findOne({ _id: templeId, isActive: true, chadavaEnabled: true });
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found or chadava disabled' });

    const devotee = await User.findById(devoteeId);
    if (!devotee) return res.status(404).json({ success: false, message: 'User not found' });

    if ((devotee.walletBalance || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required: ₹${amount}, Available: ₹${devotee.walletBalance || 0}`
      });
    }

    // Deduct wallet
    devotee.walletBalance = (devotee.walletBalance || 0) - amount;
    await devotee.save();

    const txnId = `CDV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

    const order = await TempleOrder.create({
      devotee: devoteeId,
      temple: templeId,
      templeName: temple.name,
      orderType: 'chadava',
      amount,
      dedicatedTo: dedicatedTo || '',
      paymentStatus: 'paid',
      transactionId: txnId,
    });

    res.status(201).json({
      success: true,
      message: `₹${amount} Chadava offered to ${temple.name} 🙏`,
      data: order,
      newWalletBalance: devotee.walletBalance,
    });
  } catch (err) { next(err); }
};

// @desc   Place a Prasad order
// @route  POST /api/temple/prasad
// @access Private/Devotee
exports.createPrasadOrder = async (req, res, next) => {
  try {
    const { templeId, deliveryName, deliveryAddress, deliveryCity, deliveryPincode, deliveryPhone } = req.body;
    const devoteeId = req.user.id;

    if (!templeId || !deliveryName || !deliveryAddress || !deliveryCity || !deliveryPincode || !deliveryPhone) {
      return res.status(400).json({ success: false, message: 'All delivery fields are required' });
    }

    const temple = await Temple.findOne({ _id: templeId, isActive: true, prasadEnabled: true });
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found or prasad disabled' });

    const amount = temple.prasadItem.price;
    const devotee = await User.findById(devoteeId);
    if (!devotee) return res.status(404).json({ success: false, message: 'User not found' });

    if ((devotee.walletBalance || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Required: ₹${amount}, Available: ₹${devotee.walletBalance || 0}`
      });
    }

    devotee.walletBalance = (devotee.walletBalance || 0) - amount;
    await devotee.save();

    const txnId = `PSD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

    const order = await TempleOrder.create({
      devotee: devoteeId,
      temple: templeId,
      templeName: temple.name,
      orderType: 'prasad',
      amount,
      prasadItem: temple.prasadItem.name,
      deliveryName,
      deliveryAddress,
      deliveryCity,
      deliveryPincode,
      deliveryPhone,
      deliveryStatus: 'placed',
      paymentStatus: 'paid',
      transactionId: txnId,
    });

    res.status(201).json({
      success: true,
      message: `${temple.prasadItem.name} from ${temple.name} ordered! Estimated delivery: ${temple.prasadItem.deliveryDays} days 🎁`,
      data: order,
      newWalletBalance: devotee.walletBalance,
    });
  } catch (err) { next(err); }
};

// @desc   Get my temple orders
// @route  GET /api/temple/my-orders
// @access Private/Devotee
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await TempleOrder.find({ devotee: req.user.id })
      .populate('temple', 'name image deity')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

// @desc   Admin — get all temples (incl. inactive)
// @route  GET /api/admin/temples
exports.adminGetAllTemples = async (req, res, next) => {
  try {
    const temples = await Temple.find().sort('-createdAt');
    res.json({ success: true, data: temples });
  } catch (err) { next(err); }
};

// @desc   Admin — create a new temple
// @route  POST /api/admin/temples
exports.adminCreateTemple = async (req, res, next) => {
  try {
    const { name, deity, location, state, image, description,
            chadavaEnabled, prasadEnabled, chadavaPresets, prasadItem } = req.body;

    if (!name || !deity || !location || !state) {
      return res.status(400).json({ success: false, message: 'name, deity, location, state are required' });
    }

    const temple = await Temple.create({
      name, deity, location, state,
      image: image || '',
      description: description || '',
      chadavaEnabled: chadavaEnabled !== false,
      prasadEnabled: prasadEnabled !== false,
      chadavaPresets: chadavaPresets || [51, 101, 251, 501, 1001],
      prasadItem: prasadItem || { name: 'Prasad', price: 151, deliveryDays: 7 },
    });

    res.status(201).json({ success: true, data: temple });
  } catch (err) { next(err); }
};

// @desc   Admin — update temple (name, presets, prasad price, toggle)
// @route  PUT /api/admin/temples/:id
exports.adminUpdateTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });
    res.json({ success: true, data: temple });
  } catch (err) { next(err); }
};

// @desc   Admin — deactivate temple
// @route  DELETE /api/admin/temples/:id
exports.adminDeleteTemple = async (req, res, next) => {
  try {
    const temple = await Temple.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });
    res.json({ success: true, message: 'Temple deactivated', data: temple });
  } catch (err) { next(err); }
};

// @desc   Admin — get all temple orders
// @route  GET /api/admin/temple-orders
exports.adminGetAllOrders = async (req, res, next) => {
  try {
    const { type, deliveryStatus } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.orderType = type;
    if (deliveryStatus && deliveryStatus !== 'all') filter.deliveryStatus = deliveryStatus;

    const orders = await TempleOrder.find(filter)
      .populate('devotee', 'firstName lastName email phone')
      .populate('temple', 'name image')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
};

// @desc   Admin — update order status (delivery status + tracking)
// @route  PATCH /api/admin/temple-orders/:id
exports.adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { deliveryStatus, trackingId, paymentStatus } = req.body;
    const update = {};
    if (deliveryStatus) update.deliveryStatus = deliveryStatus;
    if (trackingId !== undefined) update.trackingId = trackingId;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await TempleOrder.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('devotee', 'firstName lastName')
      .populate('temple', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// SEED TEMPLES (called on server start if DB empty)
// ─────────────────────────────────────────────────────────────
const DEFAULT_TEMPLES = [
  {
    name: 'Tirupati Balaji', deity: 'Lord Venkateswara', location: 'Tirumala', state: 'Andhra Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tirumala_temple.jpg/800px-Tirumala_temple.jpg',
    description: 'One of the most visited pilgrimage centers in the world, atop the Tirumala hills.',
    chadavaPresets: [51, 108, 251, 501, 1008],
    prasadItem: { name: 'Tirupati Ladoo (2 pcs)', price: 151, deliveryDays: 7 },
  },
  {
    name: 'Vaishno Devi', deity: 'Mata Vaishno Devi', location: 'Katra', state: 'Jammu & Kashmir',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Vaishno_Devi_Temple.jpg/800px-Vaishno_Devi_Temple.jpg',
    description: 'Sacred shrine of Mata Vaishno Devi nestled in the Trikuta Mountains.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Halwa Packet + Chunri', price: 101, deliveryDays: 7 },
  },
  {
    name: 'Shirdi Sai Baba', deity: 'Sai Baba of Shirdi', location: 'Shirdi', state: 'Maharashtra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Shirdi_Sai_Baba_temple.jpg/800px-Shirdi_Sai_Baba_temple.jpg',
    description: 'The holy Samadhi Mandir of Sai Baba, a revered spiritual master of the 19th century.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Vibhuti & Prasad Packet', price: 151, deliveryDays: 6 },
  },
  {
    name: 'Kedarnath', deity: 'Lord Shiva (Kedarnath)', location: 'Kedarnath', state: 'Uttarakhand',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Kedarnath_Temple.jpg/800px-Kedarnath_Temple.jpg',
    description: 'An ancient Shiva temple in the Himalayas, one of the 12 Jyotirlingas.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Panchamrit + Rudraksha', price: 201, deliveryDays: 8 },
  },
  {
    name: 'Somnath', deity: 'Lord Shiva (Somnath)', location: 'Prabhas Patan', state: 'Gujarat',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Somnath_temple_1.jpg/800px-Somnath_temple_1.jpg',
    description: 'The first among the 12 Jyotirlinga shrines of Shiva, on the western coast of Gujarat.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Chandan Prasad Packet', price: 101, deliveryDays: 6 },
  },
  {
    name: 'Kashi Vishwanath', deity: 'Lord Shiva (Vishwanath)', location: 'Varanasi', state: 'Uttar Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Kashi_Vishwanath_Temple.jpg/800px-Kashi_Vishwanath_Temple.jpg',
    description: 'One of the most famous Hindu temples on the banks of the holy Ganga in Varanasi.',
    chadavaPresets: [51, 101, 251, 501, 1008],
    prasadItem: { name: 'Bhasma & Chandan Packet', price: 151, deliveryDays: 5 },
  },
  {
    name: 'Siddhivinayak', deity: 'Lord Ganesha', location: 'Prabhadevi, Mumbai', state: 'Maharashtra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Siddhivinayak_mandir.JPG/800px-Siddhivinayak_mandir.JPG',
    description: 'A revered Ganesh temple in Mumbai known for granting wishes of devotees.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Modak Box (6 pcs)', price: 201, deliveryDays: 5 },
  },
  {
    name: 'Jagannath Puri', deity: 'Lord Jagannath', location: 'Puri', state: 'Odisha',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Puri_Jagannath_Temple.jpg/800px-Puri_Jagannath_Temple.jpg',
    description: 'The sacred abode of Lord Jagannath, one of the four dhams of Hinduism.',
    chadavaPresets: [51, 101, 251, 501, 1001],
    prasadItem: { name: 'Mahaprasad (Khichdi)', price: 251, deliveryDays: 8 },
  },
];

exports.seedTemples = async () => {
  try {
    const count = await Temple.countDocuments();
    if (count === 0) {
      await Temple.insertMany(DEFAULT_TEMPLES);
      console.log('[Temple] ✅ 8 default temples seeded.');
    }
  } catch (err) {
    console.error('[Temple] ❌ Seeding failed:', err.message);
  }
};
