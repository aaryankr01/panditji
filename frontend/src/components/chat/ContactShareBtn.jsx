import React from 'react';
import { PhoneCall } from 'lucide-react';

const ContactShareBtn = ({ onShare }) => {
  return (
    <button 
      onClick={onShare}
      className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
      title="Share Contact Details"
    >
      <PhoneCall size={20} />
    </button>
  );
};

export default ContactShareBtn;
