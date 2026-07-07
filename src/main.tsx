import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { LanguageProvider } from './presentation/context/LanguageContext';
import App from './App.tsx';

// ─── Top-Level Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Portfolio crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0f', color: '#f8f8f8', fontFamily: 'Inter, sans-serif',
          padding: '2rem', textAlign: 'center', gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#9ca3af', maxWidth: '480px', lineHeight: 1.6 }}>
            The portfolio encountered an unexpected error. Please refresh the page.
          </p>
          <details style={{ color: '#6b7280', fontSize: '0.8rem', maxWidth: '600px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error details</summary>
            <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
              {this.state.error?.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff',
              fontWeight: 600, fontSize: '0.95rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
