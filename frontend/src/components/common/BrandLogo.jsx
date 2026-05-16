import React from 'react';

// Professional SVG temple-inspired logo mark
const BrandLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#E8710A"/>
    {/* Temple spire */}
    <polygon points="20,5 24,14 16,14" fill="white" opacity="0.95"/>
    {/* Temple body */}
    <rect x="13" y="14" width="14" height="9" rx="1" fill="white" opacity="0.95"/>
    {/* Door */}
    <rect x="17" y="18" width="6" height="5" rx="1" fill="#7B1D0E"/>
    {/* Base steps */}
    <rect x="10" y="23" width="20" height="2" rx="1" fill="white" opacity="0.8"/>
    <rect x="8"  y="25" width="24" height="2" rx="1" fill="white" opacity="0.6"/>
    {/* Diya flame accent */}
    <circle cx="20" cy="10" r="1.5" fill="#C8960C"/>
  </svg>
);

export const BrandWordmark = ({ logoSize = 32, textClass = 'text-xl' }) => (
  <div className="flex items-center gap-2.5">
    <BrandLogo size={logoSize} />
    <div className="leading-tight">
      <span className={`font-serif font-black text-maroon tracking-tight ${textClass}`}>Pandit<span className="text-saffron">Ji</span></span>
    </div>
  </div>
);

export default BrandLogo;
