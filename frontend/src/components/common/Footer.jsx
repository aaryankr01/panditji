import React from 'react';
import { Link } from 'react-router-dom';
import { BrandWordmark } from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-14 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <BrandWordmark textClass="text-lg" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              Connecting devotees with verified and experienced Pandits for all auspicious occasions across India.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {['Griha Pravesh', 'Satyanarayan Katha', 'Vivah Sanskar', 'Havan & Yagya', 'Rudrabhishek'].map(s => (
                <li key={s}><Link to="/pujas" className="hover:text-orange-500 transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[['About Us','/about'],['Contact','/contact'],['Terms of Service','/terms'],['Privacy Policy','/privacy']].map(([l,h]) => (
                <li key={l}><Link to={h} className="hover:text-orange-500 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">For Pandits</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Register as Pandit','/register'],['Pandit Login','/login'],['Guidelines','/guidelines']].map(([l,h]) => (
                <li key={l}><Link to={h} className="hover:text-orange-500 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} PanditJi Technologies Pvt. Ltd. All rights reserved.</p>
          <Link to="/admin/login" className="mt-3 md:mt-0 hover:text-gray-400 transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
