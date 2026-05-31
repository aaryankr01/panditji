import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { BrandWordmark } from '../components/common/BrandLogo';

const Register = () => {
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect');
  const loginUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row font-sans">

      {/* Mobile top brand banner — visible only on small screens */}
      <div className="lg:hidden bg-gradient-to-r from-maroon to-purpleTheme px-5 py-5 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl inline-block">
          <BrandWordmark logoSize={32} textClass="text-xl" />
        </div>
        <div>
          <p className="text-white font-black text-base leading-tight font-serif">Join thousands of devotees.</p>
          <p className="text-white/70 text-xs mt-0.5">Book verified Pandits for every ceremony.</p>
        </div>
      </div>

      {/* Left decorative panel — visible on large screens only */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-maroon to-purpleTheme flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gold rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-saffron rounded-full blur-3xl opacity-20" />
        <div className="relative z-10">
          <div className="bg-white p-2 rounded-xl inline-block mb-8">
            <BrandWordmark logoSize={48} textClass="text-3xl" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight font-serif">
            Join thousands of devotees.
          </h2>
          <p className="text-[#EAD9CC] mt-6 text-lg leading-relaxed max-w-sm">
            Create your free account and start booking verified Pandits for every sacred ceremony.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-8 lg:px-16 overflow-y-auto bg-surface">
        <div className="max-w-lg w-full mx-auto bg-white p-5 sm:p-8 lg:p-10 rounded-3xl border border-brandborder shadow-xl shadow-saffron/5">
          <h2 className="text-2xl sm:text-3xl font-black text-maroon mb-2 font-serif">Create your account</h2>
          <p className="text-sm text-textMid mb-6">
            Already have an account?{' '}
            <Link to={loginUrl} className="font-bold text-saffron hover:text-saffron-dark transition-colors">Sign in</Link>
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
