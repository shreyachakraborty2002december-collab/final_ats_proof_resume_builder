import { useState, useEffect } from 'react';
import { X, Crown, Check, Zap, Download, Palette, Infinity, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import './PromoModal.css';

const FEATURES_FREE = [
  '1 resume template',
  'AI content enhancement',
  'ATS grading & job match',
  'Unlimited resume saves',
  'No PDF downloads',
  'No cover letter generation',
];

const FEATURES_PRO = [
  '8 premium templates',
  '10 resume PDF downloads / 30 days',
  '5 cover letter PDF downloads / 30 days',
  'AI cover letter generator',
  'ATS grading & job match',
  'Favourite templates tracking',
  'Priority support',
];

export default function PromoModal({ isOpen, onClose, onLoginRequired }) {
  const { user } = useAuth();
  const { isPro, downloadsLeft, daysRemaining } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setError('');
    if (!user) { onLoginRequired?.(); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="promo-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="ResumeAI Pro">
      <div className="promo-panel" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="promo-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        {/* Badge */}
        <div className="promo-badge">
          <Crown size={14} />
          <span>Limited Offer</span>
        </div>

        {/* Headline */}
        <div className="promo-header">
          <h2 className="promo-title">Unlock <span className="promo-title-accent">ResumeAI Pro</span></h2>
          <p className="promo-subtitle">Get premium templates, PDF downloads, and stand out from the crowd.</p>
        </div>

        {/* Pricing */}
        <div className="promo-price-block">
          <div className="promo-price">
            <span className="promo-currency">₹</span>
            <span className="promo-amount">2,999</span>
            <span className="promo-period">/ 30 days</span>
          </div>
          <p className="promo-price-note">One-time payment · No auto-renewal</p>
        </div>

        {/* Feature comparison */}
        <div className="promo-compare">
          <div className="promo-tier promo-tier-free">
            <h3 className="promo-tier-name">Free</h3>
            <ul className="promo-features">
              {FEATURES_FREE.map((f, i) => (
                <li key={i} className={f.startsWith('No') ? 'promo-feature-no' : ''}>
                  {f.startsWith('No') ? <X size={13} /> : <Check size={13} />}
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="promo-tier promo-tier-pro">
            <div className="promo-tier-pro-badge"><Star size={11} fill="currentColor" /> Pro</div>
            <h3 className="promo-tier-name">Pro</h3>
            <ul className="promo-features">
              {FEATURES_PRO.map((f, i) => (
                <li key={i}>
                  <Check size={13} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Status for existing Pro users */}
        {isPro ? (
          <div className="promo-already-pro">
            <Crown size={16} />
            <div>
              <strong>You're already Pro! 🎉</strong>
              <p>{downloadsLeft} downloads left · {daysRemaining} days remaining</p>
            </div>
          </div>
        ) : (
          <>
            {error && <p className="promo-error">{error}</p>}
            <button
              className="promo-cta"
              onClick={handleUpgrade}
              disabled={loading}
              id="btn-upgrade-pro"
            >
              {loading ? (
                <span className="promo-spinner" />
              ) : (
                <><Crown size={16} /> {user ? 'Upgrade to Pro — ₹2,999' : 'Sign in to Upgrade'}</>
              )}
            </button>
            <p className="promo-cta-note">
              {user ? 'Secure checkout via Stripe · Instant access' : 'Google sign-in required to upgrade'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
