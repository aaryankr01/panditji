import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { 
  ArrowRight, CheckCircle, Users, Star, Shield, 
  Home as HomeIcon, BookOpen, Heart, Scissors, Flame, 
  Droplets, Calendar, Sparkles, MapPin, Zap
} from 'lucide-react';

const PUJA_TYPES = [
  { name: 'Griha Pravesh', icon: HomeIcon, color: 'orange', desc: 'Start your journey in your new home with divine blessings.' },
  { name: 'Satyanarayan Katha', icon: BookOpen, color: 'blue', desc: 'A ritual of thanksgiving and prayer for prosperity.' },
  { name: 'Vivah Sanskar', icon: Heart, color: 'rose', desc: 'Sacred wedding ceremonies performed with Vedic precision.' },
  { name: 'Mundan Ceremony', icon: Scissors, color: 'amber', desc: 'Traditional first hair-cut ritual for your child\'s health.' },
  { name: 'Havan & Yagya', icon: Flame, color: 'red', desc: 'Powerful fire rituals to purify the environment and mind.' },
  { name: 'Rudrabhishek', icon: Droplets, color: 'sky', desc: 'A blissful abhisheka of Lord Shiva for inner peace.' },
  { name: 'Ganesh Puja', icon: Sparkles, color: 'yellow', desc: 'Invoking the remover of obstacles for any new beginning.' },
  { name: 'Lakshmi Puja', icon: Zap, color: 'emerald', desc: 'Prayer for wealth, light, and abundance in your life.' },
];

const colorClasses = {
  orange: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100',
  sky: 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
};

const STATS = [
  { label: 'Verified Pandits', value: '500+' },
  { label: 'Pujas Completed', value: '12,000+' },
  { label: 'Cities Covered', value: '80+' },
  { label: 'Happy Devotees', value: '10,000+' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified & Trusted',
    desc: 'Every Pandit undergoes a thorough background and credential verification process before listing.',
  },
  {
    icon: Star,
    title: 'Rated by Devotees',
    desc: 'Real reviews from real devotees help you choose the right Pandit with complete confidence.',
  },
  {
    icon: Users,
    title: 'All Ceremonies',
    desc: 'From Griha Pravesh to Vivah Sanskar — find experts for every sacred occasion.',
  },
];

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 px-4">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 -right-20 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 border border-orange-100 shadow-sm">
            <Sparkles size={14} className="animate-pulse" />
            India's Premium Puja Booking Platform
          </div>
          <h1 className="text-5xl lg:text-[84px] font-black text-gray-900 leading-[0.95] tracking-[-0.04em] mb-8">
            Sacred Pujas,<br />
            <span className="text-orange-600 relative inline-block">
              Verified Pandits.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9C118.957 4.46351 239.428 3.24351 355 9" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Experience the divine through our network of hand-picked, certified Pandits. Book authentic Vedic rituals with transparency and tradition.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/pujas"
              className="group relative flex items-center gap-2 bg-gray-900 hover:bg-orange-600 text-white text-base font-black py-5 px-10 rounded-2xl transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0"
            >
              Book a Puja <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register?role=pandit"
              className="flex items-center gap-2 bg-white text-gray-800 text-base font-bold py-5 px-10 rounded-2xl border-2 border-gray-100 hover:border-orange-200 transition-all shadow-sm"
            >
              Join as a Pandit
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-green-500" /> 100% Verified
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-green-500" /> Secure Payments
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle size={16} className="text-green-500" /> Vedic Rituals
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 px-4 -mt-20 relative z-10">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-2xl shadow-orange-200/50 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          <div>
            <p className="text-4xl font-black text-gray-900 mb-1">500+</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Expert Pandits</p>
          </div>
          <div>
            <p className="text-4xl font-black text-gray-900 mb-1">12k+</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pujas Done</p>
          </div>
          <div>
            <p className="text-4xl font-black text-gray-900 mb-1">80+</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cities Live</p>
          </div>
          <div>
            <p className="text-4xl font-black text-gray-900 mb-1">10k+</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Happy Clients</p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100/50 rounded-full blur-3xl" />
            <span className="text-orange-600 font-black text-sm uppercase tracking-widest mb-4 block">Our Story</span>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight">Bringing Tradition to the <span className="text-orange-600 italic">Modern World.</span></h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                PanditJi was born from a simple mission: to ensure that every spiritual seeker has access to authentic, high-quality Vedic ceremonies without the stress of searching.
              </p>
              <p>
                We have curated a network of thousands of Pandits who are not just experts in their craft, but also deeply committed to the sanctity of the rituals they perform.
              </p>
            </div>
            
            <div className="mt-10 p-6 bg-gray-50 rounded-[28px] border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <MapPin size={28} />
              </div>
              <div>
                <p className="font-black text-gray-900 leading-none mb-1">Pan India Service</p>
                <p className="text-sm text-gray-500">Currently serving in 80+ major cities</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-8 rounded-[40px] text-center border border-amber-200/40">
               <p className="text-xs font-black text-amber-600/60 uppercase tracking-widest mb-2">Verified</p>
               <p className="text-5xl font-black text-gray-900 mb-1">500+</p>
               <p className="font-bold text-gray-600 text-sm">Pandits</p>
             </div>
             <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 rounded-[40px] text-center border border-orange-200/40 mt-12">
               <p className="text-xs font-black text-orange-600/60 uppercase tracking-widest mb-2">Success</p>
               <p className="text-5xl font-black text-gray-900 mb-1">12k+</p>
               <p className="font-bold text-gray-600 text-sm">Sacred Pujas</p>
             </div>
             <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-8 rounded-[40px] text-center border border-rose-200/40 -mt-12">
               <p className="text-xs font-black text-rose-600/60 uppercase tracking-widest mb-2">Coverage</p>
               <p className="text-5xl font-black text-gray-900 mb-1">80+</p>
               <p className="font-bold text-gray-600 text-sm">Cities</p>
             </div>
             <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 rounded-[40px] text-center border border-emerald-200/40">
               <p className="text-xs font-black text-emerald-600/60 uppercase tracking-widest mb-2">Rating</p>
               <p className="text-5xl font-black text-gray-900 mb-1">4.9/5</p>
               <p className="font-bold text-gray-600 text-sm">Happy Users</p>
             </div>
          </div>
        </div>
      </section>

      {/* Puja Categories Section */}
      <section className="py-24 px-4 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-orange-600 font-black text-sm uppercase tracking-widest mb-3 block">Service Portfolio</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">Sacred Pujas for<br />Every <span className="text-orange-600">Milestone.</span></h2>
            </div>
            <Link to="/pujas" className="flex items-center gap-2 text-orange-600 font-black hover:gap-3 transition-all underline decoration-2 underline-offset-8">
              Explore All 13+ Pujas <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PUJA_TYPES.map(({ name, icon: Icon, color, desc }) => (
              <div key={name} className={`group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 hover:-translate-y-2`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorClasses[color]}`}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">{desc}</p>
                <Link to="/pujas" className="inline-flex items-center gap-1 text-xs font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-widest">
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Why Choose PanditJi?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">We take the guesswork out of finding the right Pandit for your most important moments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-orange-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-black mb-4">Ready to Book Your Puja?</h2>
        <p className="text-orange-100 mb-8 max-w-xl mx-auto">Join thousands of devotees who trust PanditJi for their most sacred celebrations.</p>
        <Link to="/pujas" className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold py-3.5 px-8 rounded-xl hover:bg-orange-50 transition-colors">
          Browse Pandits <ArrowRight size={18} />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
