import React from 'react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  return <Link to="/admin/login" className="hidden" />;
};

// This page file is just an alias that redirects to pages/Admin/AdminLogin.jsx
// The actual implementation lives at src/pages/Admin/AdminLogin.jsx
export { default } from './Admin/AdminLogin';
