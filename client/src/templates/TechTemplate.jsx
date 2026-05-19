/** Tech Template — developer-focused, dark header, monospace accents */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

const GREEN = '#10b981';
const DARK  = '#0f172a';
const SLATE = '#1e293b';

export default function TechTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", fontSize: 10.5, color: '#1e293b', lineHeight: 1.6, background: '#fff' }}>
      {/* Dark terminal header */}
      <div style={{ background: DARK, color: '#fff', padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: GREEN, marginBottom: 4 }}>{'>'} whoami</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#f1f5f9', letterSpacing: '-0.01em' }}>{pi.name || 'Your Name'}</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: 9.5, color: '#94a3b8' }}>
            {pi.email    && <div style={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Mail size={8}/>{pi.email}</div>}
            {pi.phone    && <div style={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Phone size={8}/>{pi.phone}</div>}
            {pi.linkedin && <div style={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Link2 size={8}/>{pi.linkedin}</div>}
            {pi.location && <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><MapPin size={8}/>{pi.location}</div>}
          </div>
        </div>
      </div>

      {summary && (
        <TechSection title="// about" accent={GREEN}>
          <p style={{ fontSize: 10.5, color: '#334155', fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>{summary}</p>
        </TechSection>
      )}

      {skills.length > 0 && (
        <TechSection title="// tech_stack" accent={GREEN}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ padding: '2px 8px', fontSize: 9.5, fontFamily: "'Courier New',monospace", fontWeight: 600, background: '#f0fdf4', color: GREEN, borderRadius: 3, border: `1px solid #bbf7d0` }}>{s}</span>
            ))}
          </div>
        </TechSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <TechSection title="// experience" accent={GREEN}>
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <div key={i} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid #e2e8f0`, position: 'relative' }}>
              <span style={{ position: 'absolute', left: -4, top: 5, width: 6, height: 6, background: GREEN, borderRadius: '50%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: SLATE, margin: 0 }}>{exp.title}</h3>
                  {exp.company && <p style={{ fontSize: 10, color: '#64748b', margin: 0, fontFamily: "'Courier New',monospace" }}>{exp.company}</p>}
                </div>
                <span style={{ fontSize: 9.5, color: GREEN, fontFamily: "'Courier New',monospace", whiteSpace: 'nowrap', flexShrink: 0 }}>{dateRange(exp)}</span>
              </div>
              {exp.bullets?.filter(Boolean).length > 0 && (
                <ul style={{ margin: '3px 0 0 12px', padding: 0, listStyle: 'none' }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => (
                    <li key={bi} style={{ fontSize: 10.5, color: '#334155', marginBottom: 2, display: 'flex', gap: 5 }}>
                      <span style={{ color: GREEN, fontFamily: 'monospace', flexShrink: 0 }}>▸</span>{b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </TechSection>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <TechSection title="// projects" accent={GREEN}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {projects.map((proj, i) => proj.name && (
              <div key={i} style={{ padding: '8px 10px', background: '#f8fafc', border: `1px solid #e2e8f0`, borderRadius: 4, borderTop: `2px solid ${GREEN}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <strong style={{ fontSize: 10.5, color: SLATE }}>{proj.name}</strong>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: GREEN }}><ExternalLink size={9}/></a>}
                </div>
                {proj.description && <p style={{ fontSize: 9.5, color: '#475569', margin: '0 0 3px' }}>{proj.description}</p>}
                {proj.technologies?.length > 0 && (
                  <p style={{ fontSize: 8.5, color: GREEN, fontFamily: 'monospace', margin: 0 }}>{proj.technologies.join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </TechSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <TechSection title="// education" accent={GREEN}>
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: SLATE, margin: 0 }}>{edu.degree}</h3>
                <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{edu.institution}</p>
              </div>
              <span style={{ fontSize: 9.5, color: '#94a3b8', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{edu.year}</span>
            </div>
          ))}
        </TechSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <TechSection title="// certifications" accent={GREEN}>
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ fontSize: 10, marginBottom: 3 }}>
              <span style={{ fontFamily: 'monospace', color: GREEN }}>✓ </span>
              <strong>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#64748b' }}> · {cert.issuer}</span>}
              {cert.year && <span style={{ color: '#94a3b8' }}> · {cert.year}</span>}
            </div>
          ))}
        </TechSection>
      )}
    </div>
  );
}

function TechSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 14, padding: '0 20px' }}>
      <h2 style={{ fontFamily: "'Courier New',monospace", fontSize: 10, fontWeight: 700, color: accent, marginBottom: 8, letterSpacing: '0.05em' }}>{title}</h2>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' → now' : exp.endDate ? ` → ${exp.endDate}` : '');
}
