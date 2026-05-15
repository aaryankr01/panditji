import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { State, City } from 'country-state-city';

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
  const [error, setError] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const indianStates = State.getStatesOfCountry('IN');
  const citiesOfState = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleChange = (role) => setFormData({ ...formData, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(formData);
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
        <input 
          type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
          className="w-full px-4 py-3 rounded-xl border border-brandborder focus:ring-2 focus:ring-saffron focus:border-saffron outline-none transition-all text-maroon"
          placeholder="••••••••"
        />
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

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center h-12 shadow-saffron/20"
      >
        {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
      </button>

      <p className="text-center text-[10px] text-textMuted mt-4">
        By creating an account you agree to our{' '}
        <Link to="/terms" className="underline hover:text-maroon font-medium">Terms of Service</Link> and Privacy Policy.
      </p>
    </form>
  );
};

export default RegisterForm;
