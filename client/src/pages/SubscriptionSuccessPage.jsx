import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Crown, CheckCircle, Download, Palette, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { activateSubscription } from '../firebase/subscriptionService';
import './SubscriptionSuccessPage.css';

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const sessionId      = searchParams.get('session_id');

  const [status,  setStatus]  = useState('verifying'); // verifying | success | error
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setError('No session ID found.'); return; }
    if (!user) return; // Wait for auth

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json();
        if (!res.ok || !data.verified) throw new Error(data.error || 'Verification failed');

        // Write subscription to Firestore from client (verified by server)
        await activateSubscription(user.uid, data);
        setStatus('success');
      } catch (err) {
        setError(err.message || 'Could not verify payment.');
        setStatus('error');
      }
    })();
  }, [sessionId, user]);

  return (
    <div className="success-page">
      <div className="success-panel">
        {/* Background glow */}
        <div className="success-glow" />

        {status === 'verifying' && (
          <div className="success-verifying">
            <Loader2 size={48} className="spin success-spinner" />
            <h2>Verifying your payment…</h2>
            <p>Please wait while we confirm your subscription.</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon-wrap">
              <Crown size={40} className="success-crown" />
            </div>
            <h1 className="success-title">
              Welcome to <span className="success-pro">ResumeAI Pro!</span>
            </h1>
            <p className="success-subtitle">
              Your 30-day Pro access is now active. You have <strong>10 PDF downloads</strong> and access to <strong>8 premium templates</strong>.
            </p>

            <div className="success-features">
              {[
                { icon: <Download size={16} />, text: '10 PDF downloads / 30 days' },
                { icon: <Palette size={16} />, text: '8 premium resume templates' },
                { icon: <Crown size={16} />, text: 'AI grading, job matching & more' },
              ].map((f, i) => (
                <div key={i} className="success-feature">
                  <CheckCircle size={16} className="success-check" />
                  <span className="success-feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="success-actions">
              <button
                className="btn btn-primary success-btn"
                onClick={() => navigate('/dashboard')}
                id="btn-go-dashboard"
              >
                Go to My Resumes
              </button>
              <button
                className="btn btn-secondary success-btn"
                onClick={() => navigate('/builder')}
                id="btn-go-builder"
              >
                Start Building
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="success-error">
            <AlertCircle size={40} className="success-error-icon" />
            <h2>Something went wrong</h2>
            <p>{error || 'Payment could not be verified.'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
          </div>
        )}
      </div>
    </div>
  );
}
