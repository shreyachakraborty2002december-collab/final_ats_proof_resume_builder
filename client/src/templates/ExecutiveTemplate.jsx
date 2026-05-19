/** Executive Template — corporate navy with blue accents, two-tone header */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

const NAVY = '#1e3a5f';
const BLUE = '#2563eb';

export default function ExecutiveTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 11, color: '#1e293b', lineHeight: 1.6, background: '#fff' }}>
      {/* Top bar */}
      <div style={{ background: NAVY, height: 6, marginBottom: 0 }} />
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', background: '#f8f9fc', borderBottom: `3px solid ${BLUE}`, marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: '-0.01em', fontFamily: "'Georgia',serif" }}>{pi.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
          {pi.email    && <ExecChip icon={<Mail size={9}/>}    label={pi.email}    />}
          {pi.phone    && <ExecChip icon={<Phone size={9}/>}   label={pi.phone}    />}
          {pi.linkedin && <ExecChip icon={<Link2 size={9}/>}   label={pi.linkedin} />}
          {pi.location && <ExecChip icon={<MapPin size={9}/>}  label={pi.location} />}
        </div>
      </div>

      {summary && <ExSection title="Executive Summary" accent={BLUE}><p style={{ fontSize: 10.5, color: '#334155', lineHeight: 1.7, fontStyle: 'italic' }}>{summary}</p></ExSection>}

      {skills.length > 0 && (
        <ExSection title="Core Competencies" accent={BLUE}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 12px' }}>
            {skills.map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 4, height: 4, background: BLUE, borderRadius: '50%', flexShrink: 0 }} />
                {s}
              </span>
            ))}
          </div>
        </ExSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <ExSection title="Professional Experience" accent={BLUE}>
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid #e2e8f0`, paddingBottom: 4, marginBottom: 5 }}>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Georgia',serif" }}>{exp.title}</h3>
                  <p style={{ fontSize: 11, color: BLUE, fontWeight: 600, margin: 0 }}>{exp.company}</p>
                </div>
                <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>{dateRange(exp)}</span>
              </div>
              {exp.bullets?.filter(Boolean).length > 0 && (
                <ul style={{ margin: '0 0 0 16px', padding: 0, listStyle: 'disc' }}>
                  {exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 10.5, color: '#334155', marginBottom: 2, lineHeight: 1.55 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </ExSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <ExSection title="Education" accent={BLUE}>
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Georgia',serif" }}>{edu.degree}</h3>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{edu.institution}</p>
              </div>
              <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>{edu.year}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</span>
            </div>
          ))}
        </ExSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <ExSection title="Certifications & Awards" accent={BLUE}>
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ marginBottom: 3, fontSize: 10.5, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 4, height: 4, background: BLUE, borderRadius: '50%', flexShrink: 0 }} />
              <strong style={{ color: NAVY }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#64748b' }}>— {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#94a3b8' }}>({cert.year})</span>}
            </div>
          ))}
        </ExSection>
      )}
      <div style={{ background: NAVY, height: 4, marginTop: 12 }} />
    </div>
  );
}

function ExecChip({ icon, label }) {
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:9.5, color:'#475569' }}>{icon}{label}</span>;
}

function ExSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 14, padding: '0 20px' }}>
      <h2 style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : '');
}
