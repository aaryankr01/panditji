import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { BrandWordmark } from '../components/common/BrandLogo';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-600 to-amber-700 flex-col justify-center px-16">
        <BrandWordmark logoSize={48} textClass="text-3xl" />
        <h2 className="text-4xl font-black text-white mt-8 leading-tight">
          Welcome back.<br />Your devotion awaits.
        </h2>
        <p className="text-orange-100 mt-4 leading-relaxed">
          Log in to access your dashboard, manage bookings, and connect with Pandits across India.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8">
            <BrandWordmark />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-500">Create one free</Link>
          </p>
          <LoginForm />
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
