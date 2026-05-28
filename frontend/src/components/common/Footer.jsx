import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-maroon text-maroon-light py-14 border-t border-[#5a140a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="bg-white p-1 rounded-xl"><BrandLogo size={28} /></div>
              <span className="font-serif font-black text-xl text-white tracking-tight">Pandit<span className="text-saffron">Ji</span></span>
            </div>
            <p className="text-sm text-[#EAD9CC] leading-relaxed mt-3">
              Connecting devotees with verified and experienced Pandits for all auspicious occasions across India.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest font-serif">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {['Griha Pravesh', 'Satyanarayan Katha', 'Vivah Sanskar', 'Havan & Yagya', 'Rudrabhishek'].map(s => (
                <li key={s}><Link to="/pujas" className="hover:text-saffron transition-colors text-[#EAD9CC]">{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest font-serif">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[['About Us','/about'],['Contact','/contact'],['Terms of Service','/terms'],['Privacy Policy','/privacy']].map(([l,h]) => (
                <li key={l}><Link to={h} className="hover:text-saffron transition-colors text-[#EAD9CC]">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest font-serif">For Pandits</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Register as Pandit','/register'],['Pandit Login','/login'],['Guidelines','/guidelines']].map(([l,h]) => (
                <li key={l}><Link to={h} className="hover:text-saffron transition-colors text-[#EAD9CC]">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#5a140a] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#EAD9CC]">
          <p>&copy; {new Date().getFullYear()} PanditJi Technologies Pvt. Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
