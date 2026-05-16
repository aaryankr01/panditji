import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle, X, Phone, Mail, ExternalLink,
  Calendar, CreditCard, User, Zap, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── Shared Tokens ─── */
const C = {
  saffron: '#E8710A',
  saffronLt: '#FFF3E8',
  maroon: '#7B1D0E',
  surface: '#FAF7F2',
  border: '#EAD9CC',
  textMid: '#6B4C3B',
  textMuted: '#A07060',
  success: '#1E7D3C',
  successLt: '#E8F5EE',
  purple: '#5B2D8E',
  purpleLt: '#F3EEFF',
};

const faqs = [
  {
    category: 'Booking',
    icon: Calendar,
    color: 'orange',
    questions: [
      { q: 'How do I book a Pandit?', a: 'Go to the "Find Pandit" tab, browse available Pandits, and click "Book Now".' },
      { q: 'What if no Pandit is available?', a: 'We will show you trusted Pandits from nearby cities.' },
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    color: 'green',
    questions: [
      { q: 'When do I pay?', a: 'Payment is made after a Pandit accepts your booking.' },
      { q: 'What payment methods are supported?', a: 'We support UPI, Credit/Debit Cards, Net Banking, and Wallets.' },
    ]
  },
  {
    category: 'Technical',
    icon: Zap,
    color: 'purple',
    questions: [
      { q: 'Chat is not working?', a: 'Ensure payment is completed for the booking — chat is locked until payment.' },
    ]
  },
];

const contactChannels = [
  { icon: Mail, label: 'Email', value: 'support@panditji.com', href: 'mailto:support@panditji.com', bg: C.saffronLt, text: C.saffron },
  { icon: Phone, label: 'Call', value: '+91 98765 43210', href: 'tel:+919876543210', bg: C.successLt, text: C.success },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat Now', href: 'https://wa.me/919876543210', bg: C.purpleLt, text: C.purple },
];

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-brandborder rounded-xl overflow-hidden mb-2 bg-white transition-all">
      <button 
        onClick={() => setOpen(!open)} 
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${open ? 'bg-surface' : 'bg-white hover:bg-surface'}`}
      >
        <span className="font-bold text-maroon text-sm pr-4">{question}</span>
        {open ? <ChevronUp size={16} className="text-saffron shrink-0" /> : <ChevronDown size={16} className="text-textMuted shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 bg-surface">
          <p className="text-xs text-textMid leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FloatingSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const location = useLocation();

  // Hide on dashboard and admin routes where full support is available
  const hiddenRoutes = ['/devotee-dashboard', '/pandit-dashboard', '/admin'];
  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    // Show a little "Need help?" tooltip after 5 seconds of loading the page
    if (isHidden) return;
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [location.pathname, isHidden, isOpen]);

  if (isHidden) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="bg-white text-maroon font-bold text-sm px-4 py-2 rounded-2xl shadow-lg border border-brandborder mb-3 mr-2 animate-bounce flex items-center gap-2">
          Need Help?
          <button onClick={() => setShowTooltip(false)} className="text-textMuted hover:text-maroon ml-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Popup Panel */}
      {isOpen && (
        <div className="bg-white w-[360px] max-h-[600px] shadow-2xl rounded-3xl border border-brandborder mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-maroon to-purple p-6 relative shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-saffron opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-white font-bold font-serif text-2xl mb-1">Live Support</h3>
                <p className="text-white/80 text-sm">We typically reply in minutes</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-surface/30">
            
            {/* Quick Contact Options */}
            <div className="mb-6">
              <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Contact Us Directly</p>
              <div className="flex flex-col gap-2">
                {contactChannels.map(({ icon: Icon, label, value, href, bg, text }) => (
                  <a 
                    key={label} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brandborder hover:border-saffron/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color: text }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-textMuted mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-maroon truncate group-hover:text-saffron transition-colors">{value}</p>
                    </div>
                    <ExternalLink size={14} className="text-brandborder group-hover:text-saffron transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Common Questions</p>
              {faqs.map(({ category, icon: Icon, questions }) => (
                <div key={category} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="text-saffron" />
                    <span className="text-xs font-bold text-maroon">{category}</span>
                  </div>
                  <div>
                    {questions.map(({ q, a }) => (
                      <FAQItem key={q} question={q} answer={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="w-14 h-14 bg-saffron text-white rounded-full shadow-[0_8px_30px_rgba(232,113,10,0.4)] hover:bg-saffron-dark hover:scale-105 transition-all flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} className="animate-pulse" />}
      </button>

    </div>
  );
};

export default FloatingSupport;
