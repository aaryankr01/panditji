import React from 'react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        type="button"
        onClick={() => onRoleChange('devotee')}
        className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${
          selectedRole === 'devotee' 
            ? 'border-orange-600 bg-orange-50 text-orange-700' 
            : 'border-gray-200 text-gray-500 hover:border-orange-200'
        }`}
      >
        I am a Devotee
      </button>
      <button
        type="button"
        onClick={() => onRoleChange('pandit')}
        className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${
          selectedRole === 'pandit' 
            ? 'border-orange-600 bg-orange-50 text-orange-700' 
            : 'border-gray-200 text-gray-500 hover:border-orange-200'
        }`}
      >
        I am a Pandit
      </button>
    </div>
  );
};

export default RoleSelector;
