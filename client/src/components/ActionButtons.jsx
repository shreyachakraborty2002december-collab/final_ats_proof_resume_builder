import { Sparkles, BarChart3, Compass, Download, Loader2, Crown, Lock } from 'lucide-react';
import './ActionButtons.css';

export default function ActionButtons({
  onGenerate,
  onGrade,
  onSuggestJobs,
  onDownload,
  loading,
  hasPreview,
  isPro        = false,
  downloadsLeft  = 0,
  downloadsLimit = 10,
}) {
  const downloadsUsed = downloadsLimit - downloadsLeft;

  return (
    <div className="action-buttons" id="action-buttons">
      {/* Primary CTA */}
      <button
        className="btn btn-primary btn-lg action-btn action-btn-generate"
        onClick={onGenerate}
        disabled={loading.generate}
        id="btn-generate"
      >
        {loading.generate
          ? <Loader2 size={18} className="spin" />
          : <Sparkles size={18} />}
        {loading.generate ? 'Enhancing…' : 'AI Enhance Resume'}
      </button>

      {/* Secondary row */}
      <div className="action-row">
        <button
          className="btn btn-secondary btn-lg action-btn"
          onClick={onGrade}
          disabled={loading.grade}
          id="btn-grade"
        >
          {loading.grade
            ? <Loader2 size={16} className="spin" />
            : <BarChart3 size={16} />}
          {loading.grade ? 'Grading…' : 'Grade Resume'}
        </button>

        <button
          className="btn btn-secondary btn-lg action-btn"
          onClick={onSuggestJobs}
          disabled={loading.suggest}
          id="btn-suggest"
        >
          {loading.suggest
            ? <Loader2 size={16} className="spin" />
            : <Compass size={16} />}
          {loading.suggest ? 'Analyzing…' : 'Suggest Jobs'}
        </button>
      </div>

      {/* Download */}
      {hasPreview && (
        <button
          className={`btn btn-lg action-btn download-btn ${isPro ? 'btn-ghost' : 'btn-download-locked'}`}
          onClick={onDownload}
          id="btn-download"
        >
          {isPro ? <Download size={18} /> : <Crown size={18} className="crown-gold" />}
          {isPro
            ? `Download PDF`
            : 'Download PDF — Pro Only'}
        </button>
      )}

      {/* Download usage meter (Pro users) */}
      {isPro && hasPreview && (
        <div className="download-meter">
          <div className="download-meter-bar">
            <div
              className="download-meter-fill"
              style={{ width: `${Math.min(100, (downloadsUsed / downloadsLimit) * 100)}%` }}
            />
          </div>
          <span className="download-meter-label">
            {downloadsLeft} of {downloadsLimit} downloads left
          </span>
        </div>
      )}
    </div>
  );
}
