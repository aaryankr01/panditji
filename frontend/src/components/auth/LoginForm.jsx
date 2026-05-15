import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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
        <label className="block text-sm font-bold text-textMid mb-1">Password</label>
        <input 
          type="password" 
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
          placeholder="••••••••"
        />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-saffron/20 flex justify-center items-center h-12"
      >
        {isLoading ? <Loader size={20} className="text-white" /> : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
