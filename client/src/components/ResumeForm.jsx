import { useState } from 'react';
import {
  User, Mail, Phone, Link2, MapPin, Briefcase, GraduationCap,
  FolderKanban, Award, Plus, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

import './ResumeForm.css';

const EMPTY_EXPERIENCE = { title: '', company: '', startDate: '', endDate: '', current: false, bullets: [''] };
const EMPTY_EDUCATION = { degree: '', institution: '', year: '', gpa: '' };
const EMPTY_PROJECT = { name: '', description: '', technologies: [], link: '' };
const EMPTY_CERT = { name: '', issuer: '', year: '' };

export default function ResumeForm({ resumeData, setResumeData }) {
  const [collapsed, setCollapsed] = useState({});

  function toggle(section) {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function update(path, value) {
    setResumeData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function addItem(arrayPath, template) {
    setResumeData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let arr = next;
      for (const k of keys) arr = arr[k];
      arr.push(JSON.parse(JSON.stringify(template)));
      return next;
    });
  }

  function removeItem(arrayPath, index) {
    setResumeData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let arr = next;
      for (const k of keys) arr = arr[k];
      arr.splice(index, 1);
      return next;
    });
  }

  // --- Skills helpers ---
  const [skillInput, setSkillInput] = useState('');

  function addSkill() {
    const s = skillInput.trim();
    if (s && !resumeData.skills.includes(s)) {
      update('skills', [...resumeData.skills, s]);
    }
    setSkillInput('');
  }

  function removeSkill(index) {
    update('skills', resumeData.skills.filter((_, i) => i !== index));
  }

  // --- Bullet helpers ---
  function updateBullet(expIndex, bulletIndex, value) {
    const exp = JSON.parse(JSON.stringify(resumeData.experience));
    exp[expIndex].bullets[bulletIndex] = value;
    update('experience', exp);
  }

  function addBullet(expIndex) {
    const exp = JSON.parse(JSON.stringify(resumeData.experience));
    exp[expIndex].bullets.push('');
    update('experience', exp);
  }

  function removeBullet(expIndex, bulletIndex) {
    const exp = JSON.parse(JSON.stringify(resumeData.experience));
    exp[expIndex].bullets.splice(bulletIndex, 1);
    update('experience', exp);
  }

  // --- Tech helpers for projects ---
  function updateProjectTech(projIndex, value) {
    const projs = JSON.parse(JSON.stringify(resumeData.projects));
    projs[projIndex].technologies = value.split(',').map((t) => t.trim()).filter(Boolean);
    update('projects', projs);
  }

  const SectionHeader = ({ icon: Icon, label, section, count }) => (
    <button className="section-header-btn" onClick={() => toggle(section)} type="button">
      <div className="section-header-left">
        <Icon size={18} className="icon" />
        <span>{label}</span>
        {count > 0 && <span className="section-count">{count}</span>}
      </div>
      {collapsed[section] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
    </button>
  );

  return (
    <div className="resume-form" id="resume-form">
      {/* --- Personal Info --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={User} label="Personal Information" section="personal" />
        {!collapsed.personal && (
          <div className="form-section-body animate-fade-in">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><User size={14} /> Full Name</label>
                <input className="form-input" id="input-name" placeholder="John Doe"
                  value={resumeData.personalInfo.name}
                  onChange={(e) => update('personalInfo.name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Mail size={14} /> Email</label>
                <input className="form-input" id="input-email" type="email" placeholder="john@email.com"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => update('personalInfo.email', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><Phone size={14} /> Phone</label>
                <input className="form-input" id="input-phone" placeholder="+1 (555) 123-4567"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => update('personalInfo.phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Link2 size={14} /> LinkedIn</label>
                <input className="form-input" id="input-linkedin" placeholder="linkedin.com/in/johndoe"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => update('personalInfo.linkedin', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><MapPin size={14} /> Location</label>
              <input className="form-input" id="input-location" placeholder="San Francisco, CA"
                value={resumeData.personalInfo.location}
                onChange={(e) => update('personalInfo.location', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* --- Summary --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={User} label="Professional Summary" section="summary" />
        {!collapsed.summary && (
          <div className="form-section-body animate-fade-in">
            <div className="form-group">
              <textarea className="form-textarea" id="input-summary" rows={3}
                placeholder="Results-driven developer with 5+ years of experience..."
                value={resumeData.summary}
                onChange={(e) => update('summary', e.target.value)} />
              <span className="char-count">{resumeData.summary.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        )}
      </div>

      {/* --- Skills --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={Award} label="Skills" section="skills" count={resumeData.skills.length} />
        {!collapsed.skills && (
          <div className="form-section-body animate-fade-in">
            <div className="skills-input-row">
              <input className="form-input" id="input-skill" placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <button className="btn btn-secondary btn-sm" onClick={addSkill} type="button">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="tags-wrap">
              {resumeData.skills.map((skill, i) => (
                <span className="tag" key={i}>
                  {skill}
                  <button className="tag-remove" onClick={() => removeSkill(i)} type="button">×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Experience --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={Briefcase} label="Experience" section="experience" count={resumeData.experience.length} />
        {!collapsed.experience && (
          <div className="form-section-body animate-fade-in">
            {resumeData.experience.map((exp, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-card-header">
                  <span className="entry-number">#{i + 1}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem('experience', i)} type="button">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" placeholder="Software Engineer"
                      value={exp.title} onChange={(e) => update(`experience.${i}.title`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" placeholder="TechCorp Inc."
                      value={exp.company} onChange={(e) => update(`experience.${i}.company`, e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" placeholder="Jan 2022"
                      value={exp.startDate} onChange={(e) => update(`experience.${i}.startDate`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" placeholder="Present"
                      value={exp.endDate} disabled={exp.current}
                      onChange={(e) => update(`experience.${i}.endDate`, e.target.value)} />
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={exp.current}
                      onChange={(e) => update(`experience.${i}.current`, e.target.checked)} />
                    <span>Current</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Bullet Points</label>
                  {exp.bullets.map((bullet, bi) => (
                    <div className="bullet-row" key={bi}>
                      <span className="bullet-dot">•</span>
                      <input className="form-input" placeholder="Describe an achievement..."
                        value={bullet} onChange={(e) => updateBullet(i, bi, e.target.value)} />
                      {exp.bullets.length > 1 && (
                        <button className="btn-icon btn-ghost" onClick={() => removeBullet(i, bi)} type="button">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => addBullet(i)} type="button">
                    <Plus size={14} /> Add bullet
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('experience', EMPTY_EXPERIENCE)} type="button">
              <Plus size={16} /> Add Experience
            </button>
          </div>
        )}
      </div>

      {/* --- Education --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={GraduationCap} label="Education" section="education" count={resumeData.education.length} />
        {!collapsed.education && (
          <div className="form-section-body animate-fade-in">
            {resumeData.education.map((edu, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-card-header">
                  <span className="entry-number">#{i + 1}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem('education', i)} type="button">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input className="form-input" placeholder="B.S. Computer Science"
                      value={edu.degree} onChange={(e) => update(`education.${i}.degree`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input className="form-input" placeholder="University Name"
                      value={edu.institution} onChange={(e) => update(`education.${i}.institution`, e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input className="form-input" placeholder="2020"
                      value={edu.year} onChange={(e) => update(`education.${i}.year`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GPA (optional)</label>
                    <input className="form-input" placeholder="3.8"
                      value={edu.gpa} onChange={(e) => update(`education.${i}.gpa`, e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('education', EMPTY_EDUCATION)} type="button">
              <Plus size={16} /> Add Education
            </button>
          </div>
        )}
      </div>

      {/* --- Projects --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={FolderKanban} label="Projects" section="projects" count={resumeData.projects.length} />
        {!collapsed.projects && (
          <div className="form-section-body animate-fade-in">
            {resumeData.projects.map((proj, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-card-header">
                  <span className="entry-number">#{i + 1}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem('projects', i)} type="button">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input className="form-input" placeholder="Task Manager App"
                      value={proj.name} onChange={(e) => update(`projects.${i}.name`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link (optional)</label>
                    <input className="form-input" placeholder="https://github.com/..."
                      value={proj.link} onChange={(e) => update(`projects.${i}.link`, e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} placeholder="Describe what you built..."
                    value={proj.description} onChange={(e) => update(`projects.${i}.description`, e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Technologies (comma separated)</label>
                  <input className="form-input" placeholder="React, Node.js, MongoDB"
                    value={proj.technologies.join(', ')}
                    onChange={(e) => updateProjectTech(i, e.target.value)} />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('projects', EMPTY_PROJECT)} type="button">
              <Plus size={16} /> Add Project
            </button>
          </div>
        )}
      </div>

      {/* --- Certifications --- */}
      <div className="form-section glass-card">
        <SectionHeader icon={Award} label="Certifications" section="certifications" count={resumeData.certifications.length} />
        {!collapsed.certifications && (
          <div className="form-section-body animate-fade-in">
            {resumeData.certifications.map((cert, i) => (
              <div className="entry-card" key={i}>
                <div className="entry-card-header">
                  <span className="entry-number">#{i + 1}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem('certifications', i)} type="button">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label className="form-label">Certification Name</label>
                    <input className="form-input" placeholder="AWS Solutions Architect"
                      value={cert.name} onChange={(e) => update(`certifications.${i}.name`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuer</label>
                    <input className="form-input" placeholder="Amazon Web Services"
                      value={cert.issuer} onChange={(e) => update(`certifications.${i}.issuer`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input className="form-input" placeholder="2023"
                      value={cert.year} onChange={(e) => update(`certifications.${i}.year`, e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('certifications', EMPTY_CERT)} type="button">
              <Plus size={16} /> Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
