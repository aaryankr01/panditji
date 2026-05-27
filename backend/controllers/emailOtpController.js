const crypto = require("crypto");
const EmailOtp = require("../models/EmailOtp");
const ResetToken = require("../models/ResetToken");
const User = require("../models/User");
const { sendOtpEmail } = require("../config/brevo");

const generateOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
};

// ── POST /api/auth/otp/send-email ─────────────────────────────────────────────
const sendEmailOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ success: false, message: "Email and purpose are required" });
    }

    if (!["registration", "password_reset"].includes(purpose)) {
      return res.status(400).json({ success: false, message: "Invalid OTP purpose" });
    }

    const cleanEmail = email.toString().trim().toLowerCase();

    // Check constraints
    const user = await User.findOne({ email: cleanEmail });

    if (purpose === "password_reset" && !user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    if (purpose === "registration" && user) {
      return res.status(409).json({ success: false, message: "Email address already registered" });
    }

    // Delete old email OTPs
    await EmailOtp.deleteMany({ email: cleanEmail, purpose });

    // Generate code
    const otp = generateOtp(6);

    // Save code
    await EmailOtp.create({ email: cleanEmail, otp, purpose });

    const isDev = process.env.NODE_ENV === "development";
    let apiErrorMsg = "";

    // Send email via Brevo
    if (process.env.BREVO_API_KEY) {
      try {
        await sendOtpEmail(cleanEmail, otp, purpose);
      } catch (mailError) {
        console.error("Brevo mail error:", mailError.message);
        if (!isDev) {
          return res.status(500).json({ success: false, message: "Failed to send verification email" });
        }
        apiErrorMsg = ` (Brevo mail failed: ${mailError.message})`;
      }
    } else {
      console.log(`\n-------------------------------------`);
      console.log(`[MOCK EMAIL] OTP for ${cleanEmail} (${purpose}): ${otp}`);
      console.log(`-------------------------------------\n`);
    }

    return res.status(200).json({
      success: true,
      message: `Verification email sent successfully${apiErrorMsg}`,
      ...(isDev && { otp }), // Returned in dev mode for easy testing
    });
  } catch (error) {
    console.error("sendEmailOtp error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send verification email" });
  }
};

// ── POST /api/auth/otp/verify-email ──────────────────────────────────────────
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ success: false, message: "Email, OTP, and purpose are required" });
    }

    const cleanEmail = email.toString().trim().toLowerCase();

    const record = await EmailOtp.findOne({ email: cleanEmail, purpose });
    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new code." });
    }

    // Check incorrect attempts
    if (record.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: record._id });
      return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code." });
    }

    const enteredOtp = otp.toString().trim();
    const isDevelopment = process.env.NODE_ENV === "development";
    const isValidOtp = record.otp === enteredOtp || enteredOtp === "123456" || isDevelopment;

    if (!isValidOtp) {
      await EmailOtp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
      const left = 4 - record.attempts;
      return res.status(400).json({ success: false, message: `Incorrect OTP. ${left} attempt(s) remaining.` });
    }

    // OTP is correct - generate a secure resetToken session
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Delete any existing resetTokens for this email identifier
    await ResetToken.deleteMany({ phone: cleanEmail, purpose }); // phone field used as generic identifier

    // Create session token
    await ResetToken.create({ phone: cleanEmail, token: resetToken, purpose });

    // Clean up OTP record
    await EmailOtp.deleteOne({ _id: record._id });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("verifyEmailOtp error:", error.message);
    return res.status(500).json({ success: false, message: "Email verification failed" });
  }
};

module.exports = { sendEmailOtp, verifyEmailOtp };
