window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `
    <div style="padding:20px;font-family:monospace">
      <h2>JavaScript Error</h2>
      <pre>${msg}</pre>
      <pre>${err?.stack || ''}</pre>
    </div>
  `;
};

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { BrowserRouter } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

const Root = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
