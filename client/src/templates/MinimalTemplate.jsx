/** Minimal Template — ultra-clean, maximum whitespace, typography-first */
import { ExternalLink } from 'lucide-react';

export default function MinimalTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10.5, color: '#111827', lineHeight: 1.7, background: '#fff', padding: '0 4px' }}>
      {/* Name + contact on one line */}
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em', color: '#111827', margin: 0, marginBottom: 4 }}>{pi.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 9.5, color: '#6b7280' }}>
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>{pi.phone}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}
          {pi.location && <span>{pi.location}</span>}
        </div>
      </div>

      {summary && <MinSection title="About"><p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.8 }}>{summary}</p></MinSection>}

      {skills.length > 0 && (
        <MinSection title="Skills">
          <p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.8 }}>{skills.join(' · ')}</p>
        </MinSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <MinSection title="Experience">
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#111827' }}>{exp.title}</span>
                <span style={{ fontSize: 9.5, color: '#9ca3af' }}>{dateRange(exp)}</span>
              </div>
              {exp.company && <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 4px' }}>{exp.company}</p>}
              {exp.bullets?.filter(Boolean).length > 0 && (
                <ul style={{ margin: '0 0 0 14px', padding: 0, listStyle: 'disc' }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 10.5, color: '#374151', marginBottom: 2, lineHeight: 1.6 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </MinSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <MinSection title="Education">
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{edu.degree}</span>
                {edu.institution && <span style={{ fontSize: 10, color: '#6b7280' }}>, {edu.institution}</span>}
              </div>
              <span style={{ fontSize: 9.5, color: '#9ca3af' }}>{edu.year}{edu.gpa ? ` · ${edu.gpa}` : ''}</span>
            </div>
          ))}
        </MinSection>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <MinSection title="Projects">
          {projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{proj.name}</span>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: '#6b7280' }}><ExternalLink size={9}/></a>}
              </div>
              {proj.description && <p style={{ fontSize: 10.5, color: '#374151', margin: 0 }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && <p style={{ fontSize: 9.5, color: '#9ca3af', margin: '2px 0 0' }}>{proj.technologies.join(', ')}</p>}
            </div>
          ))}
        </MinSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <MinSection title="Certifications">
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ marginBottom: 3, fontSize: 10.5 }}>
              <strong style={{ color: '#111827' }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#6b7280' }}> · {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#9ca3af' }}> · {cert.year}</span>}
            </div>
          ))}
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af', marginBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : '');
}
