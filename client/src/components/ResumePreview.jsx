import { getTemplate } from '../templates/index';
import './ResumePreview.css';

export default function ResumePreview({ resumeData }) {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = resumeData;
  const hasContent = personalInfo.name || summary || skills.length > 0 || experience.length > 0;

  if (!hasContent) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-icon">📄</div>
        <h3>Resume Preview</h3>
        <p>Fill in the form or upload a resume to see a live preview here.</p>
      </div>
    );
  }

  const Template = getTemplate(resumeData.template || 'default');

  return (
    <div className="resume-preview" id="resume-preview">
      <div className="preview-page" id="preview-page">
        <Template resumeData={resumeData} />
      </div>
    </div>
  );
}
