
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import './Landing.css';

const Landing = () => {
  const [currentTab, setCurrentTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('devotee');
  const navigate = useNavigate();
  const { login, error } = useAuthStore();

  const switchTab = (tab) => setCurrentTab(tab);

  const handleRoleSelect = (role) => setSelectedRole(role);

  const detectLocation = () => {
    const input = document.getElementById('city-input');
    input.placeholder = '📡 Detecting...';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Simulate city name
          input.value = 'Patna, Bihar';
          input.placeholder = 'Auto-detected city';
        },
        () => {
          input.placeholder = 'Enter city manually';
        }
      );
    } else {
      input.value = 'Patna, Bihar';
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // Simulate login for this prototype (assuming dummy user or we can integrate full login)
    // Here we'll just redirect to dashboard for now, or trigger actual store
    const success = await login("test@example.com", "password"); // Hardcoded for simplicity during UI check
    // navigate('/dashboard'); // If successful
  };

  return (
    <div className="landing-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="mandala-ring ring1"></div>
        <div className="mandala-ring ring2"></div>
        <div className="mandala-ring ring3"></div>
        <div className="mandala-ring ring4"></div>
        <div className="om-symbol">ॐ</div>

        <div className="panel-content">
          <div className="brand-badge">
            <span>🪔</span>
            <span>पंडितजी</span>
          </div>

          <h1 className="panel-title">
            Sacred <em>Puja</em><br />Made Simple
          </h1>

          <p className="panel-subtitle">
            Connect with verified Pandits in your city for every auspicious occasion — from Griha Pravesh to Satyanarayan Katha.
          </p>

          <ul className="features-list">
            <li>
              <div className="feature-icon">📍</div>
              Pandits near your location
            </li>
            <li>
              <div className="feature-icon">🕉️</div>
              All types of Puja & Havan
            </li>
            <li>
              <div className="feature-icon">💬</div>
              Chat & share contact easily
            </li>
            <li>
              <div className="feature-icon">✅</div>
              Verified & trusted Pandits
            </li>
          </ul>
        </div>

        <div className="lotus-dots">
          <div className="lotus-dot"></div>
          <div className="lotus-dot"></div>
          <div className="lotus-dot"></div>
          <div className="lotus-dot"></div>
          <div className="lotus-dot"></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="form-header">
          <h2>{currentTab === 'login' ? 'Welcome Back 🙏' : 'Join पंडितजी 🕉️'}</h2>
          <p>{currentTab === 'login' ? 'Sign in to your पंडितजी account' : 'Create your free account today'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button
            className={`tab-btn ${currentTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${currentTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN FORM */}
        <div className={`form-section ${currentTab === 'login' ? 'active' : ''}`}>
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="field-group">
              <label>Email Address</label>
              <div className="field-input-wrap">
                <span className="field-icon">📧</span>
                <input type="email" placeholder="you@email.com" />
              </div>
            </div>
            <div className="field-group">
              <label>Password</label>
              <div className="field-input-wrap">
                <span className="field-icon">🔒</span>
                <input type="password" placeholder="Enter your password" />
              </div>
            </div>
            <div className="forgot-link"><a href="#">Forgot Password?</a></div>

            {error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}

            <button className="btn-primary" type="submit">Login to पंडितजी 🪔</button>
            <div className="divider">or continue with</div>
            <button type="button" className="btn-google">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>
            <div className="form-footer">
              Don't have an account? <a onClick={() => switchTab('signup')}>Sign up free</a>
            </div>
            <div className="form-footer" style={{ marginTop: '10px' }}>
              <a onClick={() => navigate('/admin/login')}>Admin Login</a>
            </div>
          </form>
        </div>

        {/* SIGNUP FORM */}
        <div className={`form-section ${currentTab === 'signup' ? 'active' : ''}`}>
          <div className="auth-form">
            {/* Role Selector */}
            <div className="role-selector">
              <div
                className={`role-card ${selectedRole === 'devotee' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('devotee')}
              >
                <div className="role-icon">🙏</div>
                <div className="role-label">Devotee</div>
                <div className="role-sub">Book a Pandit</div>
              </div>
              <div
                className={`role-card ${selectedRole === 'pandit' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('pandit')}
              >
                <div className="role-icon">📿</div>
                <div className="role-label">Pandit</div>
                <div className="role-sub">Offer Services</div>
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label>First Name</label>
                <div className="field-input-wrap">
                  <span className="field-icon">👤</span>
                  <input type="text" placeholder="Ramesh" />
                </div>
              </div>
              <div className="field-group">
                <label>Last Name</label>
                <div className="field-input-wrap">
                  <span className="field-icon">👤</span>
                  <input type="text" placeholder="Sharma" />
                </div>
              </div>
            </div>

            <div className="field-group">
              <label>Email Address</label>
              <div className="field-input-wrap">
                <span className="field-icon">📧</span>
                <input type="email" placeholder="you@email.com" />
              </div>
            </div>

            <div className="field-group">
              <label>Mobile Number</label>
              <div className="field-input-wrap">
                <span className="field-icon">📱</span>
                <input type="tel" placeholder="+91 9876543210" />
              </div>
            </div>

            <div className="field-group">
              <label>Your City / Location</label>
              <div className="field-input-wrap">
                <span className="field-icon">📍</span>
                <input type="text" id="city-input" placeholder="Auto-detecting..." />
                <button type="button" className="city-detect-btn" onClick={detectLocation}>📡 Detect</button>
              </div>
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="field-input-wrap">
                <span className="field-icon">🔒</span>
                <input type="password" placeholder="Create a strong password" />
              </div>
            </div>

            {/* PANDIT EXTRA FIELDS */}
            <div className={`pandit-extra ${selectedRole === 'pandit' ? 'show' : ''}`}>
              <div className="field-group">
                <label>Specialization / Expertise</label>
                <div className="field-input-wrap">
                  <span className="field-icon">🕉️</span>
                  <select>
                    <option value="">Select your specialization</option>
                    <option>Griha Pravesh</option>
                    <option>Satyanarayan Katha</option>
                    <option>Vivah / Wedding</option>
                    <option>Mundan Ceremony</option>
                    <option>Navratri & Durga Puja</option>
                    <option>Havan & Yagya</option>
                    <option>Naamkaran</option>
                    <option>All Pujas</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Years of Experience</label>
                <div className="field-input-wrap">
                  <span className="field-icon">⭐</span>
                  <input type="text" placeholder="e.g. 10 years" />
                </div>
              </div>

              <div className="subscription-badge">
                <div className="sub-icon">💳</div>
                <div>
                  <div className="sub-text">Monthly Subscription</div>
                  <div className="sub-price">₹500 / month</div>
                  <div className="sub-text" style={{ fontSize: '11px', marginTop: '2px' }}>Billed after profile approval</div>
                </div>
              </div>
            </div>

            <button className="btn-primary">
              {selectedRole === 'pandit' ? '🪔 Register as Pandit' : 'Create My Account 🙏'}
            </button>

            <div className="form-footer">
              Already registered? <a onClick={() => switchTab('login')}>Login here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
