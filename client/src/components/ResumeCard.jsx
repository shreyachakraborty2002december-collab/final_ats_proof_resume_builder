import { Edit2, Trash2, FileText, Clock } from 'lucide-react';
import './ResumeCard.css';

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Unique pastel-purple gradient per card based on title hash
function cardGradient(title = '') {
  const hues = [260, 280, 300, 240, 200];
  const h    = hues[title.charCodeAt(0) % hues.length];
  return `linear-gradient(135deg, hsl(${h},60%,22%) 0%, hsl(${h+30},55%,15%) 100%)`;
}

export default function ResumeCard({ resume, onEdit, onDelete }) {
  const { id, title, updatedAt, resumeData } = resume;
  const name   = resumeData?.personalInfo?.name || title || 'Untitled';
  const skills = resumeData?.skills?.slice(0, 3) || [];

  return (
    <div className="resume-card glass-card" style={{ background: cardGradient(title) }}>
      {/* Card icon */}
      <div className="resume-card-icon">
        <FileText size={28} />
      </div>

      {/* Content */}
      <div className="resume-card-body">
        <h3 className="resume-card-title">{title || name}</h3>
        {name !== title && <p className="resume-card-name">{name}</p>}

        {skills.length > 0 && (
          <div className="resume-card-skills">
            {skills.map((s, i) => (
              <span key={i} className="resume-card-skill">{s}</span>
            ))}
          </div>
        )}

        <div className="resume-card-meta">
          <Clock size={12} />
          <span>{timeAgo(updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="resume-card-actions">
        <button
          className="resume-card-btn resume-card-edit"
          onClick={() => onEdit(id)}
          title="Edit resume"
        >
          <Edit2 size={15} />
          <span>Edit</span>
        </button>
        <button
          className="resume-card-btn resume-card-delete"
          onClick={() => onDelete(id, title || name)}
          title="Delete resume"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
