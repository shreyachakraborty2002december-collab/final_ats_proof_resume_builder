import { useState, useEffect } from 'react';
import { AlertTriangle, X, Crown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import './ExpiryWarningBanner.css';

const SESSION_KEY = 'expiry-warning-dismissed';

/**
 * Shows a dismissible warning banner when the subscription has ≤ 7 days remaining.
 * Only shows once per session (unless re-mounted after session cleared).
 */
export default function ExpiryWarningBanner({ onUpgradeClick }) {
  const { isPro, daysRemaining } = useSubscription();
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem(SESSION_KEY)
  );

  const shouldShow = isPro && daysRemaining > 0 && daysRemaining <= 7 && !dismissed;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  };

  if (!shouldShow) return null;

  const urgency = daysRemaining <= 2 ? 'critical' : daysRemaining <= 4 ? 'high' : 'medium';

  return (
    <div className={`expiry-banner expiry-banner-${urgency}`} role="alert">
      <div className="expiry-banner-inner">
        <AlertTriangle size={16} className="expiry-banner-icon" />
        <div className="expiry-banner-text">
          <strong>
            {daysRemaining === 1 ? 'Last day of Pro!' : `${daysRemaining} days left on Pro`}
          </strong>
          <span> — Your Pro subscription expires soon. Renew to keep access to premium templates, resume & cover letter downloads.</span>
        </div>
        <button
          className="expiry-banner-renew"
          onClick={onUpgradeClick}
          id="btn-expiry-renew"
        >
          <Crown size={12} /> Renew
        </button>
        <button
          className="expiry-banner-close"
          onClick={handleDismiss}
          aria-label="Dismiss warning"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
