/** Elegant Template — refined serif typography with amber/gold accents */
import { ExternalLink } from 'lucide-react';

const GOLD  = '#92400e';
const CREAM = '#fffbf5';
const LINE  = '#d6c5a0';

export default function ElegantTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 11, color: '#292524', lineHeight: 1.65, background: CREAM }}>
      {/* Elegant header */}
      <div style={{ textAlign: 'center', padding: '20px 24px 14px', borderBottom: `2px solid ${GOLD}`, marginBottom: 18, background: '#fff8ec' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>Curriculum Vitae</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Georgia',serif", letterSpacing: '-0.01em', color: '#1c1917', margin: 0, marginBottom: 8 }}>{pi.name || 'Your Name'}</h1>
        <div style={{ width: 60, height: 1, background: LINE, margin: '8px auto' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, fontSize: 9.5, color: '#78716c', fontFamily: "'Helvetica Neue',sans-serif" }}>
          {pi.email    && <span>{pi.email}</span>}
          {pi.phone    && <span>{pi.phone}</span>}
          {pi.linkedin && <span>{pi.linkedin}</span>}
          {pi.location && <span>{pi.location}</span>}
        </div>
      </div>

      {summary && <ElSection title="Profile"><p style={{ fontSize: 11, color: '#44403c', lineHeight: 1.8, fontStyle: 'italic', textAlign: 'center', padding: '0 12px' }}>{summary}</p></ElSection>}

      {skills.length > 0 && (
        <ElSection title="Areas of Expertise">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {skills.map((s, i) => <span key={i} style={{ fontSize: 10, color: GOLD, fontFamily: "'Helvetica Neue',sans-serif" }}>{s}{i < skills.length - 1 ? ' ·' : ''}</span>)}
          </div>
        </ElSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <ElSection title="Professional Experience">
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#1c1917', margin: 0, fontFamily: "'Georgia',serif" }}>{exp.title}</h3>
                  {exp.company && <p style={{ fontSize: 11, color: GOLD, fontStyle: 'italic', margin: 0 }}>{exp.company}</p>}
                </div>
                <span style={{ fontSize: 9.5, color: '#a8a29e', fontFamily: "'Helvetica Neue',sans-serif", whiteSpace: 'nowrap' }}>{dateRange(exp)}</span>
              </div>
              {exp.bullets?.filter(Boolean).length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'square' }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 10.5, color: '#44403c', marginBottom: 3, lineHeight: 1.6, fontFamily: "'Helvetica Neue',sans-serif" }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </ElSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <ElSection title="Education">
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1c1917', margin: 0 }}>{edu.degree}</h3>
                <p style={{ fontSize: 10.5, color: GOLD, fontStyle: 'italic', margin: 0 }}>{edu.institution}</p>
              </div>
              <span style={{ fontSize: 9.5, color: '#a8a29e', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>{edu.year}{edu.gpa ? ` · ${edu.gpa}` : ''}</span>
            </div>
          ))}
        </ElSection>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <ElSection title="Notable Projects">
          {projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ fontSize: 11.5, color: '#1c1917' }}>{proj.name}</strong>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: GOLD }}><ExternalLink size={9}/></a>}
              </div>
              {proj.description && <p style={{ fontSize: 10.5, color: '#44403c', margin: '2px 0', fontFamily: 'sans-serif' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && <p style={{ fontSize: 9.5, color: '#a8a29e', fontFamily: 'sans-serif', margin: 0 }}>{proj.technologies.join(' · ')}</p>}
            </div>
          ))}
        </ElSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <ElSection title="Certifications">
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ marginBottom: 4, fontSize: 10.5, fontFamily: 'sans-serif' }}>
              <strong style={{ color: '#1c1917' }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#78716c' }}> — {cert.issuer}</span>}
              {cert.year && <span style={{ color: GOLD }}> · {cert.year}</span>}
            </div>
          ))}
        </ElSection>
      )}
    </div>
  );
}

function ElSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16, padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: LINE }} />
        <h2 style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#92400e', whiteSpace: 'nowrap', margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: LINE }} />
      </div>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : '');
}
