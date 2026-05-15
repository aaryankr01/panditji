const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Specific admin protection middleware if needed
exports.adminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    req.user = await Admin.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Admin no longer exists' });
    }

    req.user.role = 'admin';
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
