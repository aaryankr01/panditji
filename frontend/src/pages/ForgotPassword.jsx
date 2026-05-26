import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import OtpInput from "../components/auth/OtpInput";
import { BrandWordmark } from "../components/common/BrandLogo";

// ─── Password Eye Toggle ──────────────────────────────────────────────────────
const PasswordInput = ({ value, onChange, placeholder, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 pr-12 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon bg-white"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-textMid hover:text-maroon transition-colors p-0.5"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ─── Strength Meter ───────────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { score: 0, label: "", color: "#EAD9CC" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
      { label: "Too short", color: "#EAD9CC" },
      { label: "Weak", color: "#EF4444" },
      { label: "Fair", color: "#F59E0B" },
      { label: "Good", color: "#84CC16" },
      { label: "Strong", color: "#10B981" },
    ];
    return { score, ...map[score] };
  };
  const { score, label, color } = getStrength();
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1 rounded transition-colors"
            style={{
              backgroundColor: i <= score ? color : "#EAD9CC"
            }} />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color }}>{label}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState("phone"); // "phone" | "email"
  // Step 1: phone or email entry
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // Step 2: OTP entry
  const [otp, setOtp] = useState("");
  // Step 3: new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);
  const timerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = (seconds = 60) => {
    setResendTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const setupRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container-forgot", {
      size: "invisible",
      callback: () => {},
    });
    return recaptchaRef.current;
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (verificationMethod === "phone") {
        const clean = phone.replace(/\D/g, "");
        if (!/^\d{10}$/.test(clean)) {
          setLoading(false);
          return setError("Please enter a valid 10-digit mobile number.");
        }

        // Pre-check phone with backend (must exist)
        await axios.post("http://localhost:5000/api/auth/check-phone", {
          phone: clean,
          purpose: "password_reset",
        });

        // Firebase sends OTP via SMS
        const verifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, `+91${clean}`, verifier);
        confirmationRef.current = result;
      } else {
        if (!email) {
          setLoading(false);
          return setError("Please enter a valid email address.");
        }

        // Send email OTP via Brevo API
        await axios.post("http://localhost:5000/api/auth/otp/send-email", {
          email: email.trim().toLowerCase(),
          purpose: "password_reset"
        });
      }

      setStep(2);
      startTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send verification code. Try again.");
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) return setError("Please enter the complete 6-digit OTP.");
    setLoading(true);
    try {
      let resetToken = "";

      if (verificationMethod === "phone") {
        // Verify with Firebase
        const result = await confirmationRef.current.confirm(otp);
        const idToken = await result.user.getIdToken();

        // Backend verifies Firebase token, returns resetToken
        const verifyRes = await axios.post("http://localhost:5000/api/auth/verify-firebase-otp", {
          idToken,
          phone: phone.replace(/\D/g, ""),
          purpose: "password_reset",
        });
        resetToken = verifyRes.data.resetToken;
      } else {
        // Verify with Brevo Email OTP
        const verifyRes = await axios.post("http://localhost:5000/api/auth/otp/verify-email", {
          email: email.trim().toLowerCase(),
          otp,
          purpose: "password_reset"
        });
        resetToken = verifyRes.data.resetToken;
      }

      if (resetToken) {
        sessionStorage.setItem("resetToken", resetToken);
        setStep(3);
      }
    } catch (err) {
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP expired. Please request a new one.");
      } else {
        setError(err.response?.data?.message || err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp("");
    setLoading(true);
    try {
      if (verificationMethod === "phone") {
        const clean = phone.replace(/\D/g, "");
        const verifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, `+91${clean}`, verifier);
        confirmationRef.current = result;
      } else {
        await axios.post("http://localhost:5000/api/auth/otp/send-email", {
          email: email.trim().toLowerCase(),
          purpose: "password_reset"
        });
      }
      startTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const resetToken = sessionStorage.getItem("resetToken");
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        resetToken,
        newPassword,
      });
      sessionStorage.removeItem("resetToken");
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndicatorClass = (active, done) => {
    return `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
      done
        ? "bg-saffron border-saffron text-white"
        : active
        ? "bg-saffron-light border-saffron text-saffron"
        : "bg-surface border-brandborder text-textMuted"
    }`;
  };

  const stepLineClass = (done) => {
    return `flex-1 h-0.5 transition-colors ${
      done ? "bg-saffron" : "bg-brandborder"
    }`;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex font-sans">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-maroon to-purpleTheme flex-col justify-center px-16 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gold rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-saffron rounded-full blur-3xl opacity-20" />

        <div className="relative z-10">
          <div className="bg-white p-2 rounded-xl inline-block mb-8">
            <BrandWordmark logoSize={48} textClass="text-3xl" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight font-serif">
            Resetting your security.
          </h2>
          <p className="text-[#EAD9CC] mt-6 text-lg leading-relaxed max-w-sm">
            Quickly and securely reset your password to regain access to your dashboard and bookings.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 overflow-y-auto bg-surface">
        <div className="max-w-lg w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-brandborder shadow-xl shadow-saffron/5">
          <div className="lg:hidden mb-8">
            <BrandWordmark />
          </div>

          <div id="recaptcha-container-forgot" />

          {/* Step Indicator — only shown for steps 1–3 */}
          {step <= 3 && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={stepIndicatorClass(step === s, step > s)}>
                    {step > s ? (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  {i < 2 && <div className={stepLineClass(step > s)} />}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: Phone / Email Input ───────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-maroon mb-2 font-serif">
                  Forgot Password?
                </h1>
                <p className="text-sm text-textMid leading-relaxed">
                  Choose your preferred verification method to reset your account password.
                </p>
              </div>

              {/* Verification Method selector */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-textMid">Reset Password Via</label>
                <div className="grid grid-cols-2 gap-2 bg-saffron-light/35 p-1 rounded-xl border border-brandborder/50">
                  <button
                    type="button"
                    onClick={() => { setVerificationMethod("phone"); setError(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      verificationMethod === "phone"
                        ? "bg-saffron text-white shadow-sm"
                        : "text-textMid hover:text-maroon hover:bg-white/50"
                    }`}
                  >
                    <span>📱</span> Phone SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => { setVerificationMethod("email"); setError(""); }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      verificationMethod === "email"
                        ? "bg-saffron text-white shadow-sm"
                        : "text-textMid hover:text-maroon hover:bg-white/50"
                    }`}
                  >
                    <span>✉️</span> Email Inbox
                  </button>
                </div>
              </div>

              {verificationMethod === "phone" ? (
                <div>
                  <label className="block text-sm font-bold text-textMid mb-1" htmlFor="phone">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-maroon">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      required
                      maxLength={10}
                      className="w-full px-4 py-3 pl-14 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-textMid mb-1" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon bg-white"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send OTP →"}
              </button>

              <p className="text-center text-sm text-textMid">
                Remember your password?{" "}
                <Link to="/login" className="font-bold text-saffron hover:text-saffron-dark transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ─────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-maroon mb-2 font-serif">
                  Enter OTP
                </h1>
                <p className="text-sm text-textMid leading-relaxed">
                  {verificationMethod === "phone" ? (
                    <>
                      We've sent a 6-digit OTP to <strong className="text-maroon">+91 {phone}</strong>.{" "}
                    </>
                  ) : (
                    <>
                      We've sent a 6-digit OTP to <strong className="text-maroon">{email}</strong>.{" "}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); setOtp(""); }}
                    className="font-bold text-saffron hover:text-saffron-dark transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    Change
                  </button>
                </p>
              </div>

              <div className="py-2">
                <OtpInput value={otp} onChange={setOtp} length={6} />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Verify OTP →"}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-textMuted">
                    Resend OTP in{" "}
                    <span className="text-saffron font-bold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs font-bold text-saffron hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── STEP 3: New Password ─────────────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-maroon mb-2 font-serif">
                  Set New Password
                </h1>
                <p className="text-sm text-textMid leading-relaxed">
                  Choose a strong password for your account.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textMid mb-1" htmlFor="newPassword">New Password</label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                  <PasswordStrength password={newPassword} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-textMid mb-1" htmlFor="confirmPassword">Confirm Password</label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1.5">
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1.5">
                      ✓ Passwords match
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Reset Password →"}
              </button>
            </form>
          )}

          {/* ── STEP 4: Success ──────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h1 className="text-3xl font-black text-maroon mb-2 font-serif">
                  Password Reset!
                </h1>
                <p className="text-sm text-textMid leading-relaxed">
                  Your password has been updated successfully. You can now log in with your new password.
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
              >
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
