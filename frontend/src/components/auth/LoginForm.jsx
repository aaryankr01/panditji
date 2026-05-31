import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Loader from '../common/Loader';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(formData.email, formData.password);
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
      <div>
        <label className="block text-sm font-bold text-textMid mb-1">Email Address</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-bold text-textMid">Password</label>
          <Link to="/forgot-password" className="text-xs font-bold text-saffron hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'} 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
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
        className="w-full bg-saffron hover:bg-saffron-dark disabled:bg-brandborder disabled:text-textMuted disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-saffron/20 flex justify-center items-center h-12"
      >
        {isLoading ? <Loader size={20} className="text-white" /> : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
