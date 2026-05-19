/** Creative Template — teal sidebar split-column for designers & creatives */
import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';

const TEAL  = '#0d9488';
const TEAL2 = '#f0fdfa';

export default function CreativeTemplate({ resumeData }) {
  const { personalInfo: pi, summary, skills, experience, education, projects, certifications } = resumeData;
  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", fontSize: 10.5, color: '#0f2a26', lineHeight: 1.6, display: 'flex', gap: 0, background: '#fff' }}>
      {/* Sidebar */}
      <div style={{ width: '30%', background: TEAL, color: '#fff', padding: '20px 14px', flexShrink: 0, minHeight: '100%' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.2, marginBottom: 6 }}>{pi.name || 'Your Name'}</h1>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.35)', marginBottom: 10 }} />
          {pi.email    && <SideItem icon={<Mail size={8}/>}   label={pi.email}    />}
          {pi.phone    && <SideItem icon={<Phone size={8}/>}  label={pi.phone}    />}
          {pi.linkedin && <SideItem icon={<Link2 size={8}/>}  label={pi.linkedin} />}
          {pi.location && <SideItem icon={<MapPin size={8}/>} label={pi.location} />}
        </div>

        {skills.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Skills</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {skills.map((s, i) => (
                <div key={i}>
                  <span style={{ fontSize: 9.5, color: '#fff' }}>{s}</span>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 2 }}>
                    <div style={{ height: '100%', width: `${60 + (i * 7 % 36)}%`, background: 'rgba(255,255,255,0.75)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && education.some(e => e.degree || e.institution) && (
          <div>
            <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Education</h3>
            {education.map((edu, i) => (edu.degree || edu.institution) && (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0 }}>{edu.degree}</p>
                <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{edu.institution}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px 16px' }}>
        {summary && (
          <div style={{ marginBottom: 16, padding: '10px 12px', background: TEAL2, borderRadius: 4, borderLeft: `3px solid ${TEAL}` }}>
            <p style={{ fontSize: 10.5, color: '#134e4a', lineHeight: 1.7, margin: 0 }}>{summary}</p>
          </div>
        )}

        {experience.length > 0 && experience.some(e => e.title || e.company) && (
          <CrSection title="Experience" accent={TEAL}>
            {experience.map((exp, i) => (exp.title || exp.company) && (
              <div key={i} style={{ marginBottom: 12, position: 'relative', paddingLeft: 10, borderLeft: `2px solid ${TEAL}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 11.5, fontWeight: 700, color: '#0f2a26', margin: 0 }}>{exp.title}</h3>
                    {exp.company && <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, margin: 0 }}>{exp.company}</p>}
                  </div>
                  <span style={{ fontSize: 9.5, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>{dateRange(exp)}</span>
                </div>
                {exp.bullets?.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '3px 0 0 12px', padding: 0, listStyle: 'disc' }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => <li key={bi} style={{ fontSize: 10, color: '#374151', marginBottom: 2 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </CrSection>
        )}

        {projects.length > 0 && projects.some(p => p.name) && (
          <CrSection title="Projects" accent={TEAL}>
            {projects.map((proj, i) => proj.name && (
              <div key={i} style={{ marginBottom: 10, padding: '8px 10px', background: TEAL2, borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <strong style={{ fontSize: 11, color: '#0f2a26' }}>{proj.name}</strong>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: TEAL }}><ExternalLink size={9}/></a>}
                </div>
                {proj.description && <p style={{ fontSize: 10, color: '#374151', margin: '0 0 3px' }}>{proj.description}</p>}
                {proj.technologies?.length > 0 && <p style={{ fontSize: 9, color: TEAL, fontWeight: 600, margin: 0 }}>{proj.technologies.join(' · ')}</p>}
              </div>
            ))}
          </CrSection>
        )}

        {certifications.length > 0 && certifications.some(c => c.name) && (
          <CrSection title="Certifications" accent={TEAL}>
            {certifications.map((cert, i) => cert.name && (
              <div key={i} style={{ marginBottom: 3, fontSize: 10 }}>
                <strong style={{ color: '#0f2a26' }}>{cert.name}</strong>
                {cert.issuer && <span style={{ color: '#6b7280' }}> — {cert.issuer}</span>}
                {cert.year && <span style={{ color: TEAL }}> · {cert.year}</span>}
              </div>
            ))}
          </CrSection>
        )}
      </div>
    </div>
  );
}

function SideItem({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, fontSize: 9, color: 'rgba(255,255,255,0.85)', wordBreak: 'break-all' }}>
      {icon}<span>{label}</span>
    </div>
  );
}

function CrSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 14, height: 2, background: accent }} />{title}
      </h2>
      {children}
    </div>
  );
}

function dateRange(exp) {
  if (!exp.startDate && !exp.endDate && !exp.current) return '';
  return exp.startDate + (exp.current ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : '');
}
