import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import './GradeResults.css';

export default function GradeResults({ gradeData }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!gradeData) return;
    let current = 0;
    const target = gradeData.atsScore;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 20);
    return () => clearInterval(timer);
  }, [gradeData]);

  if (!gradeData) return null;

  const { atsScore, breakdown, improvements } = gradeData;

  function getScoreColor(score) {
    if (score >= 75) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  function getScoreLabel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  }

  function getPriorityColor(priority) {
    if (priority === 'high') return 'var(--color-error)';
    if (priority === 'medium') return 'var(--color-warning)';
    return 'var(--color-info)';
  }

  // Circle gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="grade-results animate-slide-up" id="grade-results">
      {/* Score gauge */}
      <div className="score-section">
        <div className="score-gauge">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none"
              stroke="var(--border-subtle)" strokeWidth="8" />
            <circle cx="70" cy="70" r={radius} fill="none"
              stroke={getScoreColor(atsScore)} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <div className="score-value">
            <span className="score-number" style={{ color: getScoreColor(atsScore) }}>
              {animatedScore}
            </span>
            <span className="score-label">{getScoreLabel(atsScore)}</span>
          </div>
        </div>
        <h3 className="score-title">ATS Score</h3>
      </div>

      {/* Category breakdown */}
      <div className="breakdown-section">
        <h4 className="breakdown-title">Category Breakdown</h4>
        <div className="breakdown-list">
          {Object.entries(breakdown).map(([key, cat]) => (
            <div className="breakdown-item" key={key}>
              <div className="breakdown-item-header">
                <span className="breakdown-item-label">{cat.label}</span>
                <span className="breakdown-item-score" style={{ color: getScoreColor(cat.score) }}>
                  {cat.score}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"
                  style={{
                    width: `${cat.score}%`,
                    background: cat.score >= 75 ? 'var(--color-success)' :
                      cat.score >= 50 ? 'var(--color-warning)' : 'var(--color-error)',
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="improvements-section">
          <h4 className="breakdown-title">
            <TrendingUp size={16} /> Improvement Suggestions
          </h4>
          <div className="improvements-list">
            {improvements.map((imp, i) => (
              <div className="improvement-card" key={i}>
                <div className="improvement-icon" style={{
                  color: getPriorityColor(imp.priority || 'medium'),
                }}>
                  {imp.priority === 'high' ? <AlertTriangle size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className="improvement-content">
                  {imp.category && (
                    <span className="improvement-category" style={{
                      color: getPriorityColor(imp.priority || 'medium'),
                    }}>
                      {imp.category}
                    </span>
                  )}
                  <p className="improvement-text">{imp.suggestion || imp.issue || imp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
