import { Briefcase, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import './JobSuggestions.css';

export default function JobSuggestions({ jobData }) {
  if (!jobData) return null;

  const { bestFitRoles, missingSkills, detectedSeniority, aiInsights } = jobData;

  function getMatchColor(score) {
    if (score >= 70) return 'var(--color-success)';
    if (score >= 45) return 'var(--color-warning)';
    return 'var(--color-info)';
  }

  return (
    <div className="job-suggestions animate-slide-up" id="job-suggestions">
      {/* Seniority badge */}
      <div className="seniority-badge">
        <TrendingUp size={14} />
        <span>Detected Level: <strong>{detectedSeniority?.charAt(0).toUpperCase() + detectedSeniority?.slice(1)}</strong></span>
      </div>

      {/* Best fit roles */}
      <div className="roles-section">
        <h4 className="roles-title">
          <Briefcase size={16} /> Best-Fit Roles
        </h4>
        <div className="roles-grid">
          {bestFitRoles?.map((role, i) => {
            const aiInsight = aiInsights?.roleInsights?.find(
              (r) => r.title.toLowerCase() === role.title.toLowerCase()
            );
            return (
              <div className="role-card glass-card" key={i}>
                <div className="role-card-header">
                  <div className="role-rank">#{i + 1}</div>
                  <div className="role-info">
                    <h5 className="role-title">{role.title}</h5>
                    <span className="role-category">{role.category}</span>
                  </div>
                  <div className="role-score" style={{ color: getMatchColor(role.matchScore) }}>
                    {role.matchScore}%
                  </div>
                </div>

                {/* Match bar */}
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${role.matchScore}%`,
                    background: getMatchColor(role.matchScore),
                  }} />
                </div>

                {/* Matched keywords */}
                {role.matchedKeywords?.length > 0 && (
                  <div className="role-keywords">
                    <span className="keywords-label">Matched:</span>
                    <div className="keywords-list">
                      {role.matchedKeywords.slice(0, 6).map((kw, ki) => (
                        <span className="keyword-tag keyword-match" key={ki}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing keywords */}
                {role.missingKeywords?.length > 0 && (
                  <div className="role-keywords">
                    <span className="keywords-label">To learn:</span>
                    <div className="keywords-list">
                      {role.missingKeywords.slice(0, 4).map((kw, ki) => (
                        <span className="keyword-tag keyword-missing" key={ki}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI insight */}
                {aiInsight && (
                  <div className="role-ai-insight">
                    <Lightbulb size={14} />
                    <p>{aiInsight.whyFit}</p>
                    {aiInsight.salaryRange && (
                      <span className="salary-range">💰 {aiInsight.salaryRange}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing skills summary */}
      {missingSkills?.length > 0 && (
        <div className="missing-skills-section">
          <h4 className="roles-title">
            <AlertCircle size={16} /> Skills to Develop
          </h4>
          <div className="missing-skills-list">
            {missingSkills.map((skill, i) => (
              <span className="keyword-tag keyword-missing" key={i}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI career advice */}
      {aiInsights?.careerAdvice && (
        <div className="career-advice glass-card">
          <Lightbulb size={16} className="advice-icon" />
          <div>
            <h5 className="advice-title">Career Advice</h5>
            <p className="advice-text">{aiInsights.careerAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
