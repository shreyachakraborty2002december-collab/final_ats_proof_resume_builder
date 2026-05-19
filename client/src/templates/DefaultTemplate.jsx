/** Default / Classic Template — ATS-friendly, single column */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

export default function DefaultTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: '#1a1a2e', lineHeight: 1.55 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '2px solid #1a1a2e', marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1a2e', margin: 0, marginBottom: 6 }}>{pi.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {pi.email    && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a4a6a' }}><Mail size={10} /> {pi.email}</span>}
          {pi.phone    && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a4a6a' }}><Phone size={10} /> {pi.phone}</span>}
          {pi.linkedin && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a4a6a' }}><Link2 size={10} /> {pi.linkedin}</span>}
          {pi.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4a4a6a' }}><MapPin size={10} /> {pi.location}</span>}
        </div>
      </div>

      {summary && <Section title="Professional Summary"><p style={{ fontSize: 10.5, color: '#2a2a4e' }}>{summary}</p></Section>}

      {skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.map((s, i) => <span key={i} style={{ padding: '2px 8px', fontSize: 10, fontWeight: 500, background: '#f0f0f8', color: '#4a4a6a', borderRadius: 3 }}>{s}</span>)}
          </div>
        </Section>
      )}

      {experience.length > 0 && experience.some(e => e.title || e.company) && (
        <Section title="Experience">
          {experience.map((exp, i) => (exp.title || exp.company) && (
            <Entry key={i} title={exp.title} sub={exp.company} date={dateRange(exp)} bullets={exp.bullets} />
          ))}
        </Section>
      )}

      {education.length > 0 && education.some(e => e.degree || e.institution) && (
        <Section title="Education">
          {education.map((edu, i) => (edu.degree || edu.institution) && (
            <Entry key={i} title={edu.degree} sub={edu.institution} date={edu.year + (edu.gpa ? ` • GPA: ${edu.gpa}` : '')} />
          ))}
        </Section>
      )}

      {projects.length > 0 && projects.some(p => p.name) && (
        <Section title="Projects">
          {projects.map((proj, i) => proj.name && (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ fontSize: 12, color: '#1a1a2e' }}>{proj.name}</strong>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: '#6c5ce7', display: 'inline-flex' }}><ExternalLink size={10} /></a>}
              </div>
              {proj.description && <p style={{ fontSize: 10.5, color: '#2a2a4e', margin: '3px 0' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {proj.technologies.map((t, ti) => <span key={ti} style={{ padding: '1px 6px', fontSize: 9, fontWeight: 600, background: '#e8e8f0', color: '#5a5a7a', borderRadius: 2 }}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {certifications.length > 0 && certifications.some(c => c.name) && (
        <Section title="Certifications">
          {certifications.map((cert, i) => cert.name && (
            <div key={i} style={{ marginBottom: 3, fontSize: 10.5 }}>
              <strong style={{ color: '#1a1a2e' }}>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#6a6a8a' }}> — {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#8a8aaa', fontSize: 10 }}> ({cert.year})</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', borderBottom: '1px solid #d0d0e0', paddingBottom: 3, marginBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

function Entry({ title, sub, date, bullets }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h3>
          {sub && <p style={{ fontSize: 11, color: '#6a6a8a', fontWeight: 500, margin: 0 }}>{sub}</p>}
        </div>
        {date && <span style={{ fontSize: 10, color: '#6a6a8a', whiteSpace: 'nowrap', flexShrink: 0 }}>{date}</span>}
      </div>
      {bullets?.filter(Boolean).length > 0 && (
        <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyle: 'disc' }}>
          {bullets.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: 2, fontSize: 10.5, color: '#2a2a4e', lineHeight: 1.5 }}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  const end = exp.current ? 'Present' : exp.endDate;
  return exp.startDate ? `${exp.startDate}${end ? ' — ' + end : ''}` : end;
}
