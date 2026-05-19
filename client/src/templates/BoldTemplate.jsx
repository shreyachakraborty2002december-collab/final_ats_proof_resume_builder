/** Bold Template — commanding dark header, high-contrast, strong visual hierarchy */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

const BLACK = '#111111';
const RED   = '#dc2626';

export default function BoldTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#111827', lineHeight: 1.6, background: '#fff' }}>
      {/* Bold black header */}
      <div style={{ background: BLACK, padding: '20px 24px 16px', marginBottom: 0 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{pi.name || 'YOUR NAME'}</h1>
        <div style={{ height: 3, background: RED, width: 60, marginTop: 8, marginBottom: 10 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {pi.email    && <BoldChip label={pi.email}    />}
          {pi.phone    && <BoldChip label={pi.phone}    />}
          {pi.linkedin && <BoldChip label={pi.linkedin} />}
          {pi.location && <BoldChip label={pi.location} />}
        </div>
      </div>

      {/* Red accent bar */}
      <div style={{ height: 4, background: RED, marginBottom: 16 }} />

      {summary && (
        <BoldSection title="About">
          <p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.75, borderLeft: `3px solid ${RED}`, paddingLeft: 10 }}>{summary}</p>
        </BoldSection>
      )}

      {skills.length > 0 && (
        <BoldSection title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ padding: '3px 10px', fontSize: 10, fontWeight: 700, background: BLACK, color: '#fff', borderRadius: 2 }}>{s}</span>
            ))}
          </div>
        </BoldSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <BoldSection title="Experience">
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f9fafb', padding: '8px 10px', borderLeft: `4px solid ${RED}` }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: BLACK, margin: 0 }}>{exp.title}</h3>
                  {exp.company && <p style={{ fontSize: 11, color: '#6b7280', margin: 0, fontWeight: 500 }}>{exp.company}</p>}
                </div>
                <span style={{ fontSize: 10, color: RED, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{dateRange(exp)}</span>
              </div>
              {exp.bullets?.filter(Boolean).length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyle: 'disc' }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 10.5, color: '#374151', marginBottom: 2, lineHeight: 1.55 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </BoldSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <BoldSection title="Education">
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '6px 10px', borderLeft: `4px solid ${BLACK}`, background: '#f9fafb' }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: BLACK, margin: 0 }}>{edu.degree}</h3>
                <p style={{ fontSize: 10.5, color: '#6b7280', margin: 0 }}>{edu.institution}</p>
              </div>
              <span style={{ fontSize: 10, color: '#6b7280', whiteSpace: 'nowrap' }}>{edu.year}{edu.gpa ? ` · ${edu.gpa}` : ''}</span>
            </div>
          ))}
        </BoldSection>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <BoldSection title="Projects">
          {projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: 10, borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ fontSize: 12, fontWeight: 800, color: BLACK }}>{proj.name}</strong>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: RED }}><ExternalLink size={10}/></a>}
              </div>
              {proj.description && <p style={{ fontSize: 10.5, color: '#374151', margin: '2px 0' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                  {proj.technologies.map((t, ti) => <span key={ti} style={{ padding: '1px 6px', fontSize: 9, fontWeight: 700, background: '#f3f4f6', color: '#374151', borderRadius: 2 }}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </BoldSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <BoldSection title="Certifications">
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ fontSize: 10.5, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, background: RED, borderRadius: '50%', flexShrink: 0 }} />
              <strong>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#6b7280' }}>— {cert.issuer}</span>}
              {cert.year && <span style={{ color: '#9ca3af' }}>({cert.year})</span>}
            </div>
          ))}
        </BoldSection>
      )}
    </div>
  );
}

function BoldChip({ label }) {
  return <span style={{ fontSize: 9.5, color: '#d1d5db', letterSpacing: '0.01em' }}>{label}</span>;
}

function BoldSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16, padding: '0 20px' }}>
      <h2 style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: BLACK, borderBottom: `2px solid ${BLACK}`, paddingBottom: 4, marginBottom: 10 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : '');
}
