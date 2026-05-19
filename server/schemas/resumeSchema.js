/**
 * Normalized Resume JSON Schema
 * All resume data flows through this structure across the entire pipeline.
 */

const emptyResume = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    location: "",
  },
  summary: "",
  skills: [],
  experience: [
    // {
    //   title: "",
    //   company: "",
    //   startDate: "",
    //   endDate: "",
    //   current: false,
    //   bullets: [],
    // },
  ],
  education: [
    // {
    //   degree: "",
    //   institution: "",
    //   year: "",
    //   gpa: "",
    // },
  ],
  projects: [
    // {
    //   name: "",
    //   description: "",
    //   technologies: [],
    //   link: "",
    // },
  ],
  certifications: [
    // {
    //   name: "",
    //   issuer: "",
    //   year: "",
    // },
  ],
};

/**
 * Validates that resume data has minimum required fields.
 * Returns { valid: boolean, errors: string[] }
 */
function validateResumeData(data) {
  const errors = [];

  if (!data) {
    return { valid: false, errors: ["Resume data is required"] };
  }

  if (!data.personalInfo || !data.personalInfo.name?.trim()) {
    errors.push("Name is required");
  }

  if (
    !data.personalInfo?.email?.trim() &&
    !data.personalInfo?.phone?.trim()
  ) {
    errors.push("At least one contact method (email or phone) is required");
  }

  if (!data.skills || data.skills.length === 0) {
    errors.push("At least one skill is required");
  }

  if (!data.experience || data.experience.length === 0) {
    errors.push("At least one experience entry is required");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalizes partial resume data by filling in missing fields with defaults.
 */
function normalizeResume(data) {
  return {
    personalInfo: {
      name: data.personalInfo?.name || "",
      email: data.personalInfo?.email || "",
      phone: data.personalInfo?.phone || "",
      linkedin: data.personalInfo?.linkedin || "",
      location: data.personalInfo?.location || "",
    },
    summary: data.summary || "",
    skills: Array.isArray(data.skills) ? data.skills.filter(Boolean) : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp) => ({
          title: exp.title || "",
          company: exp.company || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current || false,
          bullets: Array.isArray(exp.bullets)
            ? exp.bullets.filter(Boolean)
            : [],
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu) => ({
          degree: edu.degree || "",
          institution: edu.institution || "",
          year: edu.year || "",
          gpa: edu.gpa || "",
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies.filter(Boolean)
            : [],
          link: proj.link || "",
        }))
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((cert) => ({
          name: cert.name || "",
          issuer: cert.issuer || "",
          year: cert.year || "",
        }))
      : [],
  };
}

module.exports = { emptyResume, validateResumeData, normalizeResume };
