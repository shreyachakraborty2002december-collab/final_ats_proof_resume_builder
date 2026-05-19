import { useState } from 'react';
import { FileText, Sparkles, Zap, LogIn, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import './Header.css';

export default function Header({ onUpgradeClick }) {
  const { user, loading } = useAuth();
  const { isPro, downloadsLeft, downloadsLimit } = useSubscription();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-glow" />
        <div className="header-inner">

          {/* Brand */}
          <Link to={user ? '/dashboard' : '/'} className="header-brand">
            <div className="header-logo">
              <FileText size={22} />
            </div>
            <div className="header-brand-text">
              <h1 className="header-title">
                Resume<span className="header-title-accent">AI</span>
              </h1>
              <p className="header-tagline">Smart Resume Builder</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="header-actions">
            {/* Badges */}
            <div className="header-badge header-badge-ai">
              <Zap size={12} />
              <span>AI-Powered</span>
            </div>
            <div className="header-badge header-badge-ats">
              <Sparkles size={12} />
              <span>ATS-Optimized</span>
            </div>

            {loading ? (
              <div className="header-auth-skeleton" aria-hidden="true" />
            ) : user ? (
              <>
                {/* Pro badge or upgrade button */}
                {isPro ? (
                  <div className="header-pro-badge" title={`${downloadsLeft}/${downloadsLimit} downloads left`}>
                    <Crown size={12} />
                    <span>Pro</span>
                  </div>
                ) : (
                  <button
                    className="header-upgrade-btn"
                    onClick={onUpgradeClick}
                    id="btn-header-upgrade"
                  >
                    <Crown size={12} />
                    <span>Upgrade</span>
                  </button>
                )}
                <Link to="/cover-letter" className="header-nav-link" id="nav-cover-letter">
                  Cover Letter
                </Link>
                <UserMenu onUpgradeClick={onUpgradeClick} />
              </>
            ) : (
              <button
                className="btn btn-primary btn-sm header-login-btn"
                onClick={() => setShowAuth(true)}
                id="btn-login"
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}
          </div>
        </div>
        <div className="header-separator" />
      </header>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
