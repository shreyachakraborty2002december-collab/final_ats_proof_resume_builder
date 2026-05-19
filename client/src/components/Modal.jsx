import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Premium centered modal with:
 * - Animated entry (scale + fade)
 * - Backdrop blur
 * - Close via X button, Escape key, or clicking outside
 */
export default function Modal({ isOpen, onClose, title, icon: Icon, children, size = 'md' }) {
  // Close on Escape key
  const handleKey = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden'; // prevent scroll behind modal
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Stop propagation so clicking inside modal doesn't close it */}
      <div
        className={`modal-panel glass-card modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            {Icon && (
              <div className="modal-title-icon">
                <Icon size={18} />
              </div>
            )}
            <h2 className="modal-title">{title}</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="modal-divider" />

        {/* Scrollable content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
