import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, FileText, Loader2, Trash2, AlertTriangle, FileEdit } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ResumeCard from '../components/ResumeCard';
import Modal from '../components/Modal';
import PromoModal from '../components/PromoModal';
import AuthModal from '../components/AuthModal';
import ExpiryWarningBanner from '../components/ExpiryWarningBanner';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserResumes, deleteResume } from '../firebase/resumeService';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [resumes,    setResumes]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPromo,  setShowPromo]  = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);

  // Real-time Firestore subscription (IndexedDB cache included)
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserResumes(user.uid, (data) => {
      setResumes(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleEdit   = useCallback((resumeId) => navigate(`/builder/${resumeId}`), [navigate]);
  const handleCreate = () => navigate('/builder');
  const handleUpload = () => navigate('/builder?upload=1');

  const confirmDelete = useCallback((id, title) => setDeleting({ id, title }), []);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteResume(deleting.id);
      toast.success('Resume deleted');
      setDeleting(null);
    } catch {
      toast.error('Failed to delete resume');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#12122a', color: '#f0f0fa', border: '1px solid rgba(168,85,247,0.22)', borderRadius: '12px', fontFamily: 'var(--font-family)' },
      }} />

      <Header onUpgradeClick={() => setShowPromo(true)} />

      <div className="dashboard-body">
        <Sidebar onUpgradeClick={() => setShowPromo(true)} />

        <main className="dashboard-main">
          <ExpiryWarningBanner onUpgradeClick={() => setShowPromo(true)} />
          {/* Page header */}
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">My Resumes</h2>
              <p className="dashboard-sub">
                {loading ? 'Loading…' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="dashboard-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cover-letter')} id="btn-coverletter">
                <FileEdit size={15} /> Cover Letter
              </button>
              <button className="btn btn-secondary" onClick={handleUpload} id="btn-upload">
                <Upload size={16} /> Upload Resume
              </button>
              <button className="btn btn-primary" onClick={handleCreate} id="btn-create">
                <PlusCircle size={16} /> Create New
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="dashboard-loading">
              <Loader2 size={32} className="spin" style={{ color: 'var(--text-accent)' }} />
              <p>Loading your resumes…</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <FileText size={48} />
              </div>
              <h3>No resumes yet</h3>
              <p>Create your first AI-powered resume or upload an existing one.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleCreate}>
                  <PlusCircle size={16} /> Create Resume
                </button>
                <button className="btn btn-secondary" onClick={handleUpload}>
                  <Upload size={16} /> Upload Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="resume-grid">
              {resumes.map(r => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete confirmation — small centred modal */}
      <Modal
        isOpen={!!deleting}
        onClose={() => !isDeleting && setDeleting(null)}
        title="Delete Resume"
        icon={AlertTriangle}
        size="sm"
      >
        <div className="delete-confirm">
          <div className="delete-confirm-icon">🗑️</div>
          <p className="delete-confirm-text">
            Permanently delete{' '}
            <strong>"{deleting?.title}"</strong>?
            <br />
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              This action cannot be undone.
            </span>
          </p>
          <div className="delete-confirm-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setDeleting(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn delete-confirm-yes"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? <><Loader2 size={14} className="spin" /> Deleting…</>
                : <><Trash2 size={14} /> Yes, Delete</>}
            </button>
          </div>
        </div>
      </Modal>

      <PromoModal
        isOpen={showPromo}
        onClose={() => setShowPromo(false)}
        onLoginRequired={() => { setShowPromo(false); setShowAuth(true); }}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

