import React from 'react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        type="button"
        onClick={() => onRoleChange('devotee')}
        className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${
          selectedRole === 'devotee' 
            ? 'border-saffron bg-saffron-light text-saffron-dark shadow-sm' 
            : 'border-brandborder text-textMid hover:border-saffron hover:text-saffron'
        }`}
      >
        I am a Devotee
      </button>
      <button
        type="button"
        onClick={() => onRoleChange('pandit')}
        className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${
          selectedRole === 'pandit' 
            ? 'border-saffron bg-saffron-light text-saffron-dark shadow-sm' 
            : 'border-brandborder text-textMid hover:border-saffron hover:text-saffron'
        }`}
      >
        I am a Pandit
      </button>
    </div>
  );
};

export default RoleSelector;
