const crypto = require("crypto");
const admin = require("../config/firebaseAdmin");
const ResetToken = require("../models/ResetToken");
const User = require("../models/User");
const Pandit = require("../models/Pandit");
const bcrypt = require("bcryptjs");

// ── POST /api/auth/check-phone ────────────────────────────────────────────────
const checkPhone = async (req, res) => {
  try {
    const { phone, purpose } = req.body;

    if (!phone) return res.status(400).json({ success: false, message: "Phone is required" });

    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const user = await User.findOne({ phone: cleanPhone });

    if (purpose === "password_reset" && !user) {
      return res.status(404).json({ success: false, message: "No account found with this phone number" });
    }

    if (purpose === "registration" && user) {
      return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    return res.status(200).json({ success: true, message: "Phone check passed" });
  } catch (error) {
    console.error("checkPhone error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── POST /api/auth/verify-firebase-otp ───────────────────────────────────────
const verifyFirebaseOtp = async (req, res) => {
  try {
    const { idToken, phone, purpose } = req.body;

    if (!idToken || !phone || !purpose) {
      return res.status(400).json({ success: false, message: "idToken, phone, and purpose are required" });
    }

    // Verify the Firebase ID token using Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Confirm the token's phone matches what the user entered
    const tokenPhone = decoded.phone_number?.replace(/^\+91/, "");
    const cleanPhone = phone.replace(/\D/g, "");

    if (tokenPhone !== cleanPhone) {
      return res.status(403).json({ success: false, message: "Phone number mismatch" });
    }

    // Generate a secure one-time reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Delete any existing reset tokens for this phone+purpose
    await ResetToken.deleteMany({ phone: cleanPhone, purpose });

    // Save the reset token
    await ResetToken.create({ phone: cleanPhone, token: resetToken, purpose });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken, // Frontend stores this in sessionStorage
    });
  } catch (error) {
    console.error("verifyFirebaseOtp error:", error.message);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ success: false, message: "Session expired. Please verify OTP again." });
    }
    if (error.code === "auth/argument-error") {
      return res.status(401).json({ success: false, message: "Invalid verification token." });
    }
    return res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Reset token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Find and validate the reset token
    const tokenRecord = await ResetToken.findOne({
      token: resetToken,
      purpose: "password_reset",
      used: false,
    });

    if (!tokenRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token. Please start over." });
    }

    // Find the user by phone or email depending on token identifier format
    const identifier = tokenRecord.phone;
    let user;
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier.toLowerCase().trim() });
    } else {
      user = await User.findOne({ phone: identifier });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hash and update password (findOneAndUpdate doesn't trigger pre-save hook, hash manually)
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    if (identifier.includes("@")) {
      await User.findOneAndUpdate(
        { email: identifier.toLowerCase().trim() },
        { password: hashedPassword }
      );
    } else {
      await User.findOneAndUpdate(
        { phone: identifier },
        { password: hashedPassword }
      );
    }

    // Mark token as used and delete it
    await ResetToken.deleteOne({ _id: tokenRecord._id });

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    return res.status(500).json({ success: false, message: "Password reset failed" });
  }
};

// ── POST /api/auth/register ────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      city,
      state,
      panditSpecialization,
      panditExperience,
      resetToken
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !role || !city || !resetToken) {
      return res.status(400).json({ success: false, message: "All required fields and resetToken are required" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanEmail = email.toString().trim().toLowerCase();

    // Validate the reset token for registration purpose (can be phone or email based)
    const tokenRecord = await ResetToken.findOne({
      token: resetToken,
      $or: [
        { phone: cleanPhone },
        { phone: cleanEmail }
      ],
      purpose: "registration",
      used: false,
    });

    if (!tokenRecord) {
      return res.status(403).json({
        success: false,
        message: "Verification token mismatch or expired. Please complete OTP verification first.",
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // Double-check phone doesn't already exist
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    // Create User (pre-save hook hashes password, but we can rely on model or hash here. 
    // Since User schema has pre-save hashing: we do NOT hash password here, it'll hash on user.create/save).
    const user = await User.create({
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone,
      password, // Pre-save hooks hashes it
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
          feePerPuja: 1500,
          subscription: { isActive: false }
        });

        user.panditProfile = panditProfile._id;
        await user.save();
      } catch (profileErr) {
        console.error('Pandit Profile Creation Error:', profileErr);
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: profileErr.message || 'Failed to create pandit profile. Please check all fields.'
        });
      }
    }

    const token = user.getJWT();

    // Clean up token
    await ResetToken.deleteOne({ _id: tokenRecord._id });

    return res.status(201).json({
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
  } catch (error) {
    console.error("register error:", error.message);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

module.exports = { checkPhone, verifyFirebaseOtp, resetPassword, register };
