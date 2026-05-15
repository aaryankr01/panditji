import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { BrandWordmark } from '../components/common/BrandLogo';

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-orange-600 to-amber-700 flex-col justify-center px-16">
        <BrandWordmark logoSize={48} textClass="text-3xl" />
        <h2 className="text-4xl font-black text-white mt-8 leading-tight">
          Join thousands of devotees.
        </h2>
        <p className="text-orange-100 mt-4 leading-relaxed">
          Create your free account and start booking verified Pandits for every sacred ceremony.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="max-w-lg w-full mx-auto">
          <div className="lg:hidden mb-8">
            <BrandWordmark />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-500">Sign in</Link>
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
