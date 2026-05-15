import useAuthStore from '../store/useAuthStore';

// Convenience hook to access auth state and actions
const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, register } = useAuthStore();
  return { user, token, isAuthenticated, isLoading, login, logout, register };
};

export default useAuth;
