import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

// Google "G" SVG logo
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err.code === 'auth/popup-closed-by-user'
        ? 'Sign-in was cancelled.'
        : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-panel" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Branding */}
        <div className="auth-brand">
          <div className="auth-logo">✦</div>
          <h2 className="auth-title">Welcome to ResumeAI</h2>
          <p className="auth-subtitle">Sign in to save your resumes, track your progress, and download PDFs.</p>
        </div>

        {/* Google button */}
        <button
          className="auth-google-btn"
          onClick={handleGoogle}
          disabled={loading}
        >
          {loading ? (
            <span className="auth-spinner" />
          ) : (
            <GoogleLogo />
          )}
          <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-note">
          By continuing, you agree to our Terms of Service. Your Google account handles 2FA &amp; security automatically.
        </p>
      </div>
    </div>
  );
}
