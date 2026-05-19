import { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

export default function LogoutModal({ isOpen, onClose }) {
  const { logout }    = useAuth();
  const navigate      = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onClose();
      navigate('/', { replace: true });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out" icon={AlertTriangle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>👋</div>
        <div>
          <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to sign out? Your saved resumes will still be here when you return.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn"
            style={{
              flex: 1,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
            }}
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? '…' : <><LogOut size={16} /> Sign Out</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
