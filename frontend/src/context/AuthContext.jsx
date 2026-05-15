import React, { createContext, useContext } from 'react';
import useAuthStore from '../store/useAuthStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const authStore = useAuthStore();

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
