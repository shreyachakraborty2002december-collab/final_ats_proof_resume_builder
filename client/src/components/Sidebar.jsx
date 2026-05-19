import { useState } from 'react';
import {
  LayoutDashboard, PlusCircle, Upload, ChevronLeft,
  ChevronRight, FileText, LogOut, Crown, Zap, FileEdit,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import LogoutModal from './LogoutModal';
import './Sidebar.css';

const NAV = [
  { id: 'dashboard',    label: 'My Resumes',    icon: LayoutDashboard, path: '/dashboard' },
  { id: 'new',          label: 'Create Resume',  icon: PlusCircle,      path: '/builder' },
  { id: 'upload',       label: 'Upload Resume',  icon: Upload,          path: '/builder?upload=1' },
  { id: 'cover-letter', label: 'Cover Letter',   icon: FileEdit,        path: '/cover-letter' },
];

export default function Sidebar({ onUpgradeClick }) {
  const { user }   = useAuth();
  const {
    isPro,
    downloadsLeft, downloadsLimit,
    coverLetterDownloadsLeft, coverLetterDownloadsLimit,
    daysRemaining,
  } = useSubscription();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [showLogout, setShowLogout] = useState(false);

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar-collapsed', String(!c));
      return !c;
    });
  };

  const isActive = (path) =>
    location.pathname + location.search === path ||
    (path === '/dashboard' && location.pathname === '/dashboard');

  const resumeUsed = downloadsLimit - downloadsLeft;
  const clUsed     = coverLetterDownloadsLimit - coverLetterDownloadsLeft;

  return (
    <>
      <aside className={`sidebar glass-card ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo"><FileText size={20} /></div>
          {!collapsed && <span className="sidebar-brand-name">ResumeAI</span>}
        </div>

        {/* Collapse toggle */}
        <button className="sidebar-toggle" onClick={toggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="sidebar-item-icon" />
              {!collapsed && <span className="sidebar-item-label">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Subscription status */}
        {!collapsed && (
          <div className="sidebar-sub-status">
            {isPro ? (
              <div className="sidebar-sub-pro">
                <div className="sidebar-sub-pro-header">
                  <Crown size={13} />
                  <span>Pro Plan</span>
                  <span className={`sidebar-sub-days ${daysRemaining <= 7 ? 'sidebar-sub-days-warn' : ''}`}>
                    {daysRemaining}d left
                  </span>
                </div>

                {/* Resume downloads meter */}
                <div className="sidebar-sub-meter-row">
                  <span className="sidebar-sub-meter-label-top">Resumes</span>
                  <div className="sidebar-sub-meter">
                    <div className="sidebar-sub-meter-fill" style={{ width: `${Math.min(100, (resumeUsed / downloadsLimit) * 100)}%` }} />
                  </div>
                  <span className="sidebar-sub-meter-label">{downloadsLeft}/{downloadsLimit}</span>
                </div>

                {/* Cover letter downloads meter */}
                <div className="sidebar-sub-meter-row">
                  <span className="sidebar-sub-meter-label-top">Cover Letters</span>
                  <div className="sidebar-sub-meter">
                    <div className="sidebar-sub-meter-fill sidebar-sub-meter-fill-cl" style={{ width: `${Math.min(100, (clUsed / coverLetterDownloadsLimit) * 100)}%` }} />
                  </div>
                  <span className="sidebar-sub-meter-label">{coverLetterDownloadsLeft}/{coverLetterDownloadsLimit}</span>
                </div>
              </div>
            ) : (
              <button className="sidebar-sub-upgrade" onClick={onUpgradeClick} id="btn-sidebar-upgrade">
                <Crown size={13} />
                <div>
                  <span className="sidebar-sub-upgrade-title">Upgrade to Pro</span>
                  <span className="sidebar-sub-upgrade-sub">₹2,999 · 30 days</span>
                </div>
                <Zap size={13} className="sidebar-sub-upgrade-zap" />
              </button>
            )}
          </div>
        )}

        {/* Bottom: user + logout */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`}
                alt={user.displayName}
                className="sidebar-avatar"
                referrerPolicy="no-referrer"
                onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`; }}
              />
              {!collapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.displayName?.split(' ')[0]}</span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
              )}
            </div>
          )}
          <button
            className="sidebar-logout"
            onClick={() => setShowLogout(true)}
            title="Sign out"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} />
    </>
  );
}
