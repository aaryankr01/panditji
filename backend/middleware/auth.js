const { protect, authorize } = require('./authMiddleware');

// Proxy to the main authMiddleware file to maintain structure
module.exports = {
  protect,
  authorize
};
