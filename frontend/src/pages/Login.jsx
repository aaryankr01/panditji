import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { BrandWordmark } from '../components/common/BrandLogo';

const Login = () => {
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect');
  const registerUrl = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row font-sans">

      {/* Mobile top brand banner — visible only on small screens */}
      <div className="lg:hidden bg-gradient-to-r from-maroon to-purpleTheme px-5 py-5 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl inline-block">
          <BrandWordmark logoSize={32} textClass="text-xl" />
        </div>
        <div>
          <p className="text-white font-black text-base leading-tight font-serif">Welcome back.</p>
          <p className="text-white/70 text-xs mt-0.5">Your devotion awaits.</p>
        </div>
      </div>

      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-maroon to-purpleTheme flex-col justify-center px-16 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 -right-20 w-96 h-96 bg-saffron rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-gold rounded-full blur-3xl opacity-20" />
        
        <div className="relative z-10">
          <div className="bg-white p-2 rounded-xl inline-block mb-8">
            <BrandWordmark logoSize={48} textClass="text-3xl" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight font-serif">
            Welcome back.<br />Your devotion awaits.
          </h2>
          <p className="text-[#EAD9CC] mt-6 text-lg leading-relaxed max-w-md">
            Log in to access your dashboard, manage bookings, and connect with Pandits across India.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-8 lg:px-20 bg-surface overflow-y-auto">
        <div className="max-w-md w-full mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-brandborder shadow-xl shadow-saffron/5">
          <div className="lg:hidden mb-6">
            <BrandWordmark />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-maroon mb-2 font-serif">Sign in</h2>
          <p className="text-sm text-textMid mb-6">
            Don't have an account?{' '}
            <Link to={registerUrl} className="font-bold text-saffron hover:text-saffron-dark transition-colors">Create one free</Link>
          </p>
          <LoginForm />
          <p className="text-center text-xs text-textMuted mt-6">
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline hover:text-maroon">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
