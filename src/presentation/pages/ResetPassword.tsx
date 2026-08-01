/**
 * ResetPassword Page
 *
 * Handles the /reset-password route that Supabase redirects to after the admin
 * clicks the reset link in their email. Supabase appends an access_token and
 * type=recovery to the URL fragment (#access_token=...&type=recovery).
 *
 * Supabase JS v2 automatically picks up the session from the URL hash via
 * onAuthStateChange (PASSWORD_RECOVERY event). We just need to:
 *  1. Listen for that event.
 *  2. Let the admin set a new password via supabase.auth.updateUser().
 *  3. Redirect to /admin on success.
 */

import React, { useState, useEffect } from 'react';
import { authGateway, isSupabaseMode } from '../../infrastructure/gateways';

interface ResetPasswordProps {
  onNavigate: (path: string) => void;
}

type Phase = 'waiting' | 'form' | 'success' | 'error' | 'mock';

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isSupabaseMode) {
      // Mock mode — no real token possible
      setPhase('mock');
      return;
    }

    // Supabase v2 fires PASSWORD_RECOVERY via onAuthStateChange when
    // it detects type=recovery in the URL hash.
    const { unsubscribe } = authGateway.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setPhase('form');
      }
    });

    // Fallback: if the hash has access_token already parsed (user landed with token)
    // we also check SIGNED_IN which Supabase fires after exchanging the recovery token.
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      // Supabase JS will process the hash automatically; wait for the event.
      // Show a brief loading indicator.
      setPhase('waiting');
    }

    return () => unsubscribe();
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authGateway.updateUser(undefined, newPassword);
      setPhase('success');
      // Redirect to admin after short delay
      setTimeout(() => onNavigate('/admin'), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. The reset link may have expired.');
      setPhase('error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render States ────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    padding: '36px',
  };

  if (phase === 'waiting') {
    return (
      <div className="auth-container" style={containerStyle}>
        <div className="glass-panel auth-card" style={cardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 800 }}>
            Verifying Reset Link…
          </h2>
          <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
            Please wait while we verify your reset token. This only takes a moment.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid hsl(var(--accent))',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'mock') {
    return (
      <div className="auth-container" style={containerStyle}>
        <div className="glass-panel auth-card" style={cardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 800 }}>
            Password Reset
          </h2>
          <div style={{
            padding: '14px', background: 'rgba(245,158,11,0.12)',
            border: '1px solid #f59e0b', borderRadius: '8px',
            color: '#f59e0b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px'
          }}>
            <strong>⚠️ Mock Mode Active</strong><br />
            Real password reset emails require Supabase. Set{' '}
            <code style={{ fontFamily: 'monospace' }}>VITE_SUPABASE_URL</code> and{' '}
            <code style={{ fontFamily: 'monospace' }}>VITE_SUPABASE_ANON_KEY</code> in your environment.
            <br /><br />
            In Mock Mode you can change your password directly from the <strong>Settings</strong> tab inside the admin dashboard after logging in.
          </div>
          <button
            id="mock-reset-back-btn"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('/admin')}
          >
            ← Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="auth-container" style={containerStyle}>
        <div className="glass-panel auth-card" style={cardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 800 }}>
            Password Updated ✅
          </h2>
          <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
            Your password has been changed successfully. Redirecting you to the admin login…
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="auth-container" style={containerStyle}>
        <div className="glass-panel auth-card" style={cardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem', fontWeight: 800 }}>
            Reset Failed
          </h2>
          <div style={{
            padding: '12px', background: 'rgba(225,29,72,0.1)',
            border: '1px solid #e11d48', borderRadius: '8px',
            color: '#e11d48', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px'
          }}>
            {errorMsg || 'The reset link may have expired. Please request a new one.'}
          </div>
          <button
            id="reset-error-back-btn"
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => onNavigate('/admin')}
          >
            ← Back to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // phase === 'form'
  return (
    <div className="auth-container" style={containerStyle}>
      <div className="glass-panel auth-card" style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.4rem', fontWeight: 800 }}>
          Set New Password
        </h2>
        <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.88rem', marginBottom: '24px' }}>
          Choose a strong password for your admin account.
        </p>

        {errorMsg && (
          <div style={{
            padding: '10px', background: 'rgba(225,29,72,0.1)',
            border: '1px solid #e11d48', borderRadius: '8px',
            color: '#e11d48', fontSize: '0.85rem', marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleResetSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              id="reset-new-password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              className="form-input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button
            id="reset-password-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Updating Password…' : 'Update Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            id="reset-form-back-btn"
            type="button"
            onClick={() => onNavigate('/admin')}
            style={{
              background: 'none', border: 'none',
              color: 'hsl(var(--text-muted))', cursor: 'pointer',
              fontSize: '0.85rem', textDecoration: 'underline', padding: 0
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
