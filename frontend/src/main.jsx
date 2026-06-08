// Catch synchronous JS errors
window.onerror = (msg, src, line, col, err) => {
  console.error('[iOS Debug] window.onerror:', msg, err?.stack);
};

// ← THIS IS THE KEY iOS FIX:
// iOS Safari silently swallows unhandled Promise rejections causing white pages.
// Firebase auth, Socket.IO, and async module imports all use Promises.
window.addEventListener('unhandledrejection', (event) => {
  console.error('[iOS Debug] Unhandled rejection:', event.reason);
  event.preventDefault(); // Prevent the app from crashing silently
});

import React, { useEffect, Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { BrowserRouter } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// React Error Boundary — shows a friendly error instead of blank white page
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[iOS Debug] React error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#FAF7F2', minHeight: '100vh' }}>
          <h2 style={{ color: '#7B1D0E', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>Please screenshot this and share with support:</p>
          <pre style={{
            background: '#fff', border: '1px solid #EAD9CC', borderRadius: 8,
            padding: 12, fontSize: 11, overflowX: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-all', color: '#333', marginBottom: 16,
          }}>
            {this.state.error?.message || 'Unknown error'}{'\n\n'}
            {this.state.error?.stack || ''}
          </pre>
          <button
            onClick={() => window.location.href = '/'}
            style={{ padding: '10px 24px', background: '#E8710A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Root = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </BrowserRouter>
);
