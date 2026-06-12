const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./socket');

// Route imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const panditRoutes = require('./routes/pandits');
const devoteeRoutes = require('./routes/devotees');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const supportRoutes = require('./routes/support');
const pujaRoutes = require('./routes/pujas');
const notificationRoutes = require('./routes/notifications');

// Connect DB
connectDB();

const app = express();
app.set('trust proxy', true); // Trust reverse proxy headers (Vercel, Render, Cloudflare, etc.) to get correct client IPs
const server = http.createServer(app);

// Socket.io setup
const allowedOriginsList = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Allow any Vercel preview deployment URL in addition to the exact allowed origins
const isOriginAllowed = (origin) => {
  if (!origin) return true; // same-origin / server-to-server
  if (allowedOriginsList.includes(origin)) return true;
  // Allow all *.vercel.app subdomains (Vercel preview deployments)
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(null, isOriginAllowed(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Initialize socket handlers
initSocket(io);

// ─── CORS must come FIRST — before helmet and rate limiters ──────────────────
// Pre-flight OPTIONS requests are short-circuited here so they never hit the
// rate limiter or helmet restrictive headers.
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Handle pre-flight for every route

// Security middleware (after CORS so helmet doesn't strip CORS headers)
app.use(helmet({
  crossOriginResourcePolicy: false, // allow cross-origin responses
 }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 100 to 1000 to prevent blocking active users
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increased from 20 to 200 to prevent blocking developers/users
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sanitize data
// app.use(mongoSanitize());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PanditJi API running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pandits', panditRoutes);
app.use('/api/devotees', devoteeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/pujas', pujaRoutes);
app.use('/api/notifications', notificationRoutes);

// Inject io into bookingController for real-time broadcasts
const bookingController = require('./controllers/bookingController');
bookingController.setIO(io);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🪔 PanditJi Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

module.exports = { app, io };