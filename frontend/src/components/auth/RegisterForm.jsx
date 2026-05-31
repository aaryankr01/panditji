import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { State, City } from 'country-state-city';
import OtpInput from './OtpInput';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import axios from "axios";
import api from '../../utils/api';
import { Eye, EyeOff } from 'lucide-react';


const RegisterForm = () => {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryRole = searchParams.get('role');
  const redirect = searchParams.get('redirect');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    state: '',
    role: queryRole === 'pandit' ? 'pandit' : 'devotee',
    panditSpecialization: '',
    panditExperience: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow states
  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState('phone'); // 'phone' | 'email'
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);
  const timerRef = useRef(null);

  const indianStates = State.getStatesOfCountry('IN');
  const citiesOfState = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleChange = (role) => setFormData({ ...formData, role });

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = (seconds = 60) => {
    setResendTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const setupRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container-register", {
      size: "invisible",
      callback: () => { },
    });
    return recaptchaRef.current;
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpValue('');
    setOtpLoading(true);
    try {
      if (verificationMethod === 'phone') {
        const clean = formData.phone.replace(/\D/g, "");
        const verifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, `+91${clean}`, verifier);
        confirmationRef.current = result;
      } else {
        await api.post('/auth/otp/send-email', {
          email: formData.email,
          purpose: "registration"
        });
      }
      startTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegisterWithOtp = async (e) => {
    e.preventDefault?.();
    setError('');
    setOtpLoading(true);
    try {
      let resetToken = '';

      if (verificationMethod === 'phone') {
        const clean = formData.phone.replace(/\D/g, "");

        // Verify with Firebase
        const result = await confirmationRef.current.confirm(otpValue);
        const idToken = await result.user.getIdToken();

        // Backend verifies Firebase token, returns resetToken
        const verifyRes = await api.post('/auth/verify-firebase-otp', {
          idToken,
          phone: clean,
          purpose: "registration"
        });
        resetToken = verifyRes.data.resetToken;
      } else {
        // Verify with Brevo Email OTP
        const verifyRes = await api.post('/auth/otp/verify-email', {
          email: formData.email,
          otp: otpValue,
          purpose: "registration"
        });
        resetToken = verifyRes.data.resetToken;
      }

      if (resetToken) {
        const cleanPhone = formData.phone.replace(/\D/g, "");
        const res = await register({
          ...formData,
          phone: cleanPhone,
          resetToken
        });
        if (res.success) {
          if (redirect) {
            navigate(redirect);
          } else if (res.user.role === 'pandit') {
            navigate('/pandit-dashboard');
          } else {
            navigate('/devotee-dashboard');
          }
        } else {
          setError(res.message);
          setStep(1); // Go back to forms if database creation errors
        }
      }
    } catch (err) {
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP expired. Please request a new one.");
      } else {
        setError(err.response?.data?.message || err.message || 'Verification failed');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      return setError('Please enter a valid 10-digit mobile number.');
    }

    if (!formData.email) {
      return setError('Please enter a valid email address.');
    }

    setOtpLoading(true);
    try {
      if (verificationMethod === 'phone') {
        // Pre-check phone with backend
        await api.post('/auth/check-phone', {
          phone: cleanPhone,
          purpose: "registration"
        });

        // Firebase sends OTP via SMS
        const verifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, `+91${cleanPhone}`, verifier);
        confirmationRef.current = result;
      } else {
        // Send email OTP via Brevo API
        await api.post('/auth/otp/send-email', {
          email: formData.email,
          purpose: "registration"
        });
      }

      setStep(2);
      startTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.');
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } finally {
      setOtpLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div id="recaptcha-container-register" />
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

        <div className="text-center">
          <p className="text-sm text-textMid mb-4">
            {verificationMethod === 'phone' ? (
              <>We have sent a 6-digit verification code to <span className="font-bold text-maroon">+91 {formData.phone}</span>.</>
            ) : (
              <>We have sent a 6-digit verification code to <span className="font-bold text-maroon">{formData.email}</span>.</>
            )}
          </p>

          <div className="my-4">
            <OtpInput value={otpValue} onChange={setOtpValue} />
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRegisterWithOtp}
            disabled={otpLoading || otpValue.length < 6}
            className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
          >
            {otpLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            onClick={() => { setStep(1); setError(''); }}
            className="w-full text-center text-sm font-bold text-saffron hover:text-saffron-dark transition-colors"
          >
            Edit Registration Details
          </button>
        </div>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-xs text-textMuted">
              Resend OTP in <span className="font-bold text-saffron">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs font-bold text-saffron hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div id="recaptcha-container-register" />
      <RoleSelector selectedRole={formData.role} onRoleChange={handleRoleChange} />

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-textMid mb-1">First Name</label>
          <input
            type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
            className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-textMid mb-1">Last Name</label>
          <input
            type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
            className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-textMid mb-1">Email Address</label>
        <input
          type="email" name="email" value={formData.email} onChange={handleChange} required
          className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-textMid mb-1">Phone Number</label>
        <input
          type="tel" name="phone" value={formData.phone} onChange={handleChange} required
          className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
          placeholder="+91 9876543210"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-textMid mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full pl-4 pr-11 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-saffron transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-textMid mb-1">State</label>
          <select
            name="state"
            value={selectedStateCode}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedStateCode(code);
              const stateName = indianStates.find(s => s.isoCode === code)?.name || '';
              setFormData({ ...formData, state: stateName, city: '' });
            }}
            required
            className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all bg-white text-maroon"
          >
            <option value="">Select State</option>
            {indianStates.map(state => (
              <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-textMid mb-1">City</label>
          <select
            name="city" value={formData.city} onChange={handleChange} required disabled={!selectedStateCode}
            className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all bg-white disabled:bg-surface disabled:text-textMuted text-maroon"
          >
            <option value="">Select City</option>
            {citiesOfState.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      {formData.role === 'pandit' && (
        <div className="space-y-4 p-4 bg-saffron-light rounded-2xl border border-saffron">
          <p className="text-sm font-bold text-maroon">Pandit Details</p>
          <div>
            <label className="block text-xs font-bold text-textMid mb-1">Specialization</label>
            <input
              type="text" name="panditSpecialization" value={formData.panditSpecialization} onChange={handleChange} required={formData.role === 'pandit'}
              className="w-full px-4 py-2 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-sm text-maroon"
              placeholder="e.g. Vedic Rituals, Astrology"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-textMid mb-1">Experience (Years)</label>
            <input
              type="number" name="panditExperience" value={formData.panditExperience} onChange={handleChange} required={formData.role === 'pandit'}
              className="w-full px-4 py-2 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-sm text-maroon"
              placeholder="10"
            />
          </div>
        </div>
      )}

      {/* OTP Verification Method Selector */}
      <div className="space-y-2 mt-4">
        <label className="block text-sm font-bold text-textMid mb-1">Verify Account Using</label>
        <div className="grid grid-cols-2 gap-2 bg-saffron-light/35 p-1 rounded-xl border border-brandborder/50">
          <button
            type="button"
            onClick={() => setVerificationMethod('phone')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${verificationMethod === 'phone'
              ? 'bg-saffron text-white shadow-sm'
              : 'text-textMid hover:text-maroon hover:bg-white/50'
              }`}
          >
            <span>📱</span> Phone SMS
          </button>
          <button
            type="button"
            onClick={() => setVerificationMethod('email')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${verificationMethod === 'email'
              ? 'bg-saffron text-white shadow-sm'
              : 'text-textMid hover:text-maroon hover:bg-white/50'
              }`}
          >
            <span>✉️</span> Email Inbox
          </button>
        </div>
      </div>

      {/* Agreements Checklist */}
      <div className="mt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-brandborder text-saffron focus:ring-saffron bg-white cursor-pointer"
          />
          <span className="text-[11px] text-textMuted group-hover:text-maroon transition-colors leading-tight">
            I agree to the <Link to="/terms" target="_blank" className="font-bold text-saffron hover:underline">Terms of Service</Link>, <Link to="/privacy" target="_blank" className="font-bold text-saffron hover:underline">Privacy Policy</Link>, and <Link to="/guidelines" target="_blank" className="font-bold text-saffron hover:underline">Community Guidelines</Link>.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !agreed}
        className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
      >
        {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
