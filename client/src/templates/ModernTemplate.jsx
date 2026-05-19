/** Modern Template — Purple accent, bold headers, left border highlights */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

const P = '#7c3aed'; // purple accent

export default function ModernTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#1f1f2e', lineHeight: 1.6, background: '#fff' }}>
      {/* Header band */}
      <div style={{ background: P, color: '#fff', padding: '18px 0 14px', marginBottom: 16, borderRadius: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px', paddingLeft: 20 }}>{pi.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, paddingLeft: 20, opacity: 0.92 }}>
          {pi.email    && <Chip icon={<Mail size={9}/>}    label={pi.email}    />}
          {pi.phone    && <Chip icon={<Phone size={9}/>}   label={pi.phone}    />}
          {pi.linkedin && <Chip icon={<Link2 size={9}/>}   label={pi.linkedin} />}
          {pi.location && <Chip icon={<MapPin size={9}/>}  label={pi.location} />}
        </div>
      </div>

      {summary && <ModSection title="Summary" accent={P}><p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.65 }}>{summary}</p></ModSection>}

      {skills.length > 0 && (
        <ModSection title="Skills" accent={P}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.map((s, i) => <span key={i} style={{ padding: '3px 10px', fontSize: 10, fontWeight: 600, background: '#f3f0ff', color: P, borderRadius: 20, border: `1px solid #e5d8ff` }}>{s}</span>)}
          </div>
        </ModSection>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <ModSection title="Experience" accent={P}>
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <ModEntry key={i} title={exp.title} sub={exp.company} date={dateRange(exp)} bullets={exp.bullets} accent={P} />
          ))}
        </ModSection>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <ModSection title="Education" accent={P}>
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <ModEntry key={i} title={edu.degree} sub={edu.institution} date={edu.year + (edu.gpa ? ` • GPA: ${edu.gpa}` : '')} accent={P} />
          ))}
        </ModSection>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <ModSection title="Projects" accent={P}>
          {projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid #e5d8ff` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ fontSize: 12, color: '#1f1f2e' }}>{proj.name}</strong>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: P }}><ExternalLink size={10}/></a>}
              </div>
              {proj.description && <p style={{ fontSize: 10.5, color: '#374151', margin: '2px 0' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                  {proj.technologies.map((t, ti) => <span key={ti} style={{ padding: '1px 6px', fontSize: 9, fontWeight: 600, background: '#f3f0ff', color: P, borderRadius: 2 }}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </ModSection>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <ModSection title="Certifications" accent={P}>
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ marginBottom: 3, fontSize: 10.5 }}>
              <strong style={{ color: '#1f1f2e' }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#6b7280' }}> — {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#9ca3af', fontSize: 10 }}> ({cert.year})</span>}
            </div>
          ))}
        </ModSection>
      )}
    </div>
  );
}

function Chip({ icon, label }) {
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:9.5, color:'#fff' }}>{icon}{label}</span>;
}

function ModSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 3, height: 12, background: accent, borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function ModEntry({ title, sub, date, bullets, accent }) {
  return (
    <div style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid #e5d8ff` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1f1f2e', margin: 0 }}>{title}</h3>
          {sub && <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, margin: 0 }}>{sub}</p>}
        </div>
        {date && <span style={{ fontSize: 10, color: accent, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{date}</span>}
      </div>
      {bullets?.filter(Boolean).length > 0 && (
        <ul style={{ margin: '3px 0 0 14px', padding: 0, listStyle: 'disc' }}>
          {bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10.5, color: '#374151', marginBottom: 2, lineHeight: 1.5 }}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' — Present' : exp.endDate ? ` — ${exp.endDate}` : '');
}
