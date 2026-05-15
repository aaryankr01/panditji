import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import GlobalNotificationListener from './components/common/GlobalNotificationListener';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PujaList from './pages/PujaList';
import BookAPuja from './pages/BookAPuja';
import PanditProfile from './pages/PanditProfile';
import TermsOfService from './pages/TermsOfService';

// User Pages
import DevoteeDashboard from './pages/DevoteeDashboard';
import PanditDashboard from './pages/PanditDashboard';
import BookingPage from './pages/BookingPage';
import ChatPage from './pages/ChatPage';

// Admin Pages (original)
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/Dashboard';
import ChatTracker from './pages/Admin/ChatTracker';

// Admin Pages (new modular)
import ManagePandits from './admin/ManagePandits';
import ManageDevotees from './admin/ManageDevotees';
import AllBookings from './admin/AllBookings';
import Payments from './admin/Payments';
import Analytics from './admin/Analytics';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster />
      <GlobalNotificationListener />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pujas" element={<BookAPuja />} />
        <Route path="/pandits" element={<PujaList />} />
        <Route path="/pandit/:id" element={<PanditProfile />} />
        <Route path="/terms" element={<TermsOfService />} />

      {/* Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

      {/* Protected - Devotee */}
      <Route path="/devotee-dashboard" element={
        <ProtectedRoute allowedRoles={['devotee']}><DevoteeDashboard /></ProtectedRoute>
      } />
      <Route path="/book/:id" element={
        <ProtectedRoute allowedRoles={['devotee']}><BookingPage /></ProtectedRoute>
      } />

      {/* Protected - Pandit */}
      <Route path="/pandit-dashboard" element={
        <ProtectedRoute allowedRoles={['pandit']}><PanditDashboard /></ProtectedRoute>
      } />

      {/* Protected - Both */}
      <Route path="/chat" element={
        <ProtectedRoute allowedRoles={['devotee', 'pandit']}><ChatPage /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/chats" element={<AdminRoute><ChatTracker /></AdminRoute>} />
      <Route path="/admin/pandits" element={<AdminRoute><ManagePandits /></AdminRoute>} />
      <Route path="/admin/devotees" element={<AdminRoute><ManageDevotees /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AllBookings /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><Payments /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  );
}

export default App;
