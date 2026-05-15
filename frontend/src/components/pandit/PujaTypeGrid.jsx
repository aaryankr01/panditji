import React, { useState } from 'react';
import {
  Home, Heart, BookOpen, User, Star, Sparkles, Flame, Zap,
  ShieldCheck, Droplets, AlertCircle, Compass, Scissors, Leaf,
  Swords, Award, BookMarked, Moon, Globe, Link2
} from 'lucide-react';

const PUJA_TYPES = [
  { name: 'Griha Pravesh',      icon: Home,        desc: 'House warming ceremony' },
  { name: 'Vivah Sanskar',      icon: Heart,       desc: 'Marriage ceremonies' },
  { name: 'Satyanarayan Katha', icon: BookOpen,     desc: 'Auspicious story telling' },
  { name: 'Namakaran',          icon: User,         desc: 'Naming ceremony' },
  { name: 'Ganesh Puja',        icon: Star,         desc: 'Blessings of Lord Ganesha' },
  { name: 'Laxmi Puja',         icon: Sparkles,     desc: 'Goddess of prosperity' },
  { name: 'Navratri Puja',      icon: Flame,        desc: 'Nine nights celebration' },
  { name: 'Havan & Yagya',      icon: Zap,          desc: 'Sacred fire rituals' },
  { name: 'Maha Mrityunjaya',   icon: ShieldCheck,  desc: 'Health & longevity mantra' },
  { name: 'Rudrabhishek',       icon: Droplets,     desc: 'Shiva abhisheka puja' },
  { name: 'Kaal Sarp Dosh',     icon: AlertCircle,  desc: 'Remedial puja for dosha' },
  { name: 'Vastu Shanti',       icon: Compass,      desc: 'Harmony of living space' },
  { name: 'Mundan Ceremony',    icon: Scissors,     desc: 'First haircut ritual' },
  { name: 'Annaprashan',        icon: Leaf,         desc: 'First rice feeding ceremony' },
  { name: 'Durga Puja',         icon: Swords,       desc: 'Worship of Goddess Durga' },
  { name: 'Hanuman Puja',       icon: Award,        desc: 'Devotion to Lord Hanuman' },
  { name: 'Sunderkand Path',    icon: BookMarked,   desc: 'Recitation of Ramcharitmanas' },
  { name: 'Pitru Tarpan',       icon: Moon,         desc: 'Ancestral offerings & rituals' },
  { name: 'Navgrah Puja',       icon: Globe,        desc: 'Nine planetary worship' },
  { name: 'Janeu Ceremony',     icon: Link2,        desc: 'Sacred thread ceremony' },
];

const PujaTypeGrid = ({ onSelectPuja }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (name) => {
    const next = name === selected ? null : name;
    setSelected(next);
    if (onSelectPuja) onSelectPuja(next);
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Browse by Puja Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {PUJA_TYPES.map(({ name, icon: Icon, desc }) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all cursor-pointer group ${
              selected === name
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-orange-400 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
              selected === name ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600'
            }`}>
              <Icon size={20} />
            </div>
            <span className={`text-xs font-bold leading-tight ${selected === name ? 'text-orange-700' : 'text-gray-700'}`}>
              {name}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PujaTypeGrid;
