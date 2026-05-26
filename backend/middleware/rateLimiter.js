const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV === "development";

// Check-phone: max 5 per 10 min per IP (100 in development)
const checkPhoneLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: { success: false, message: "Too many requests. Please wait 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify: max 5 per 15 min per IP (100 in development)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: { success: false, message: "Too many verification attempts. Try again later." },
});

// Reset password: max 10 per hour per IP (100 in development)
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: { success: false, message: "Too many password reset attempts." },
});

module.exports = { checkPhoneLimiter, verifyOtpLimiter, resetPasswordLimiter };
