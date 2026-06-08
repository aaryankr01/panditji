import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import GlobalNotificationListener from './components/common/GlobalNotificationListener';
import FloatingSupport from './components/common/FloatingSupport';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// ── Lazy-loaded pages (each becomes its own small chunk) ──────────────────────
// This is the KEY fix for iOS blank page: instead of one 9MB bundle,
// iOS downloads only the page it needs (~200-400KB each).
const Home            = lazy(() => import('./pages/Home'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));
const PujaList        = lazy(() => import('./pages/PujaList'));
const BookAPuja       = lazy(() => import('./pages/BookAPuja'));
const PanditProfile   = lazy(() => import('./pages/PanditProfile'));
const TermsOfService  = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'));
const Guidelines      = lazy(() => import('./pages/Guidelines'));
const EPujaPage       = lazy(() => import('./pages/EPujaPage'));
const DevoteeDashboard = lazy(() => import('./pages/DevoteeDashboard'));
const PanditDashboard  = lazy(() => import('./pages/PanditDashboard'));
const BookingPage      = lazy(() => import('./pages/BookingPage'));
const ChatPage         = lazy(() => import('./pages/ChatPage'));
const AdminLogin       = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard   = lazy(() => import('./pages/Admin/Dashboard'));
const ChatTracker      = lazy(() => import('./pages/Admin/ChatTracker'));
const ManagePandits    = lazy(() => import('./admin/ManagePandits'));
const ManageDevotees   = lazy(() => import('./admin/ManageDevotees'));
const AllBookings      = lazy(() => import('./admin/AllBookings'));
const Payments         = lazy(() => import('./admin/Payments'));
const Analytics        = lazy(() => import('./admin/Analytics'));

// Simple loading spinner shown while a page chunk is downloading
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAF7F2',
  }}>
    <div style={{
      width: 48, height: 48,
      border: '4px solid #EAD9CC',
      borderTop: '4px solid #E8710A',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster />
      <GlobalNotificationListener />
      <FloatingSupport />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/"            element={<Home />} />
          <Route path="/pujas"       element={<BookAPuja />} />
          <Route path="/pandits"     element={<PujaList />} />
          <Route path="/pandit/:id"  element={<PanditProfile />} />
          <Route path="/terms"       element={<TermsOfService />} />
          <Route path="/privacy"     element={<PrivacyPolicy />} />
          <Route path="/guidelines"  element={<Guidelines />} />
          <Route path="/e-puja"      element={<EPujaPage />} />

          {/* Auth Routes */}
          <Route path="/login"          element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register"       element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />

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
          <Route path="/admin/login"      element={<AdminLogin />} />
          <Route path="/admin/dashboard"  element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/chats"      element={<AdminRoute><ChatTracker /></AdminRoute>} />
          <Route path="/admin/pandits"    element={<AdminRoute><ManagePandits /></AdminRoute>} />
          <Route path="/admin/devotees"   element={<AdminRoute><ManageDevotees /></AdminRoute>} />
          <Route path="/admin/bookings"   element={<AdminRoute><AllBookings /></AdminRoute>} />
          <Route path="/admin/payments"   element={<AdminRoute><Payments /></AdminRoute>} />
          <Route path="/admin/analytics"  element={<AdminRoute><Analytics /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
