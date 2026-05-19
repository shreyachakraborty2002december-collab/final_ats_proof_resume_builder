const mammoth = require("mammoth");

/**
 * Extract raw text from an uploaded file buffer.
 * Supports PDF and DOCX.
 *
 * pdf-parse v2.x (installed) uses a class-based API:
 *   const { PDFParse } = require("pdf-parse");
 *   const result = await new PDFParse({ data: buffer }).getText();
 *   return result.text;   // full concatenated text
 *
 * This is completely different from v1.x which was a plain function.
 */
async function parseFile(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    // Destructure the named class export from pdf-parse v2.x
    const { PDFParse } = require("pdf-parse");

    const parser = new PDFParse({
      data: buffer,           // Node.js Buffer is automatically handled
      verbosity: 0,           // suppress console noise
    });

    try {
      // getText() returns TextResult { text: string, pages: PageTextResult[], total: number }
      const result = await parser.getText({
        pageJoiner: "\n",     // join pages with newline instead of default page-number markers
      });
      return result.text || "";
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error("Unsupported file type. Only PDF and DOCX are accepted.");
}

/**
 * Heuristic parser: converts raw resume text into the normalized JSON schema.
 * Uses regex patterns and section-header detection.
 */
function textToResumeJson(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const resume = {
    personalInfo: { name: "", email: "", phone: "", linkedin: "", location: "" },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  // --- Extract contact info ---
  const emailMatch = rawText.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  if (emailMatch) resume.personalInfo.email = emailMatch[0];

  const phoneMatch = rawText.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/
  );
  if (phoneMatch) resume.personalInfo.phone = phoneMatch[0].trim();

  const linkedinMatch = rawText.match(
    /(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/i
  );
  if (linkedinMatch) {
    resume.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }

  // Name: usually the first non-empty line that isn't an email/phone/url
  for (const line of lines.slice(0, 5)) {
    if (
      !line.match(/@/) &&
      !line.match(/\d{3}/) &&
      !line.match(/linkedin/i) &&
      !line.match(/http/i) &&
      line.length > 2 &&
      line.length < 60
    ) {
      resume.personalInfo.name = line;
      break;
    }
  }

  // --- Detect sections ---
  const sectionPatterns = {
    summary:
      /^(summary|profile|objective|about\s*me|professional\s*summary)/i,
    skills:
      /^(skills|technical\s*skills|core\s*competencies|technologies|key\s*skills)/i,
    experience:
      /^(experience|work\s*experience|professional\s*experience|employment)/i,
    education: /^(education|academic|qualifications)/i,
    projects: /^(projects|personal\s*projects|key\s*projects)/i,
    certifications:
      /^(certifications?|certificates?|licenses?|credentials)/i,
  };

  const sections = {};
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        currentSection = section;
        if (!sections[section]) sections[section] = [];
        matched = true;
        break;
      }
    }

    if (!matched && currentSection) {
      sections[currentSection].push(line);
    }
  }

  // --- Parse summary ---
  if (sections.summary) {
    resume.summary = sections.summary.join(" ").slice(0, 500);
  }

  // --- Parse skills ---
  if (sections.skills) {
    const skillsText = sections.skills.join(", ");
    resume.skills = skillsText
      .split(/[,|;•·▪●]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 50);
  }

  // --- Parse experience ---
  if (sections.experience) {
    let currentExp = null;

    for (const line of sections.experience) {
      // Detect date patterns like "Jan 2020 - Present" or "2019-2021"
      const datePattern =
        /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4}\s*[-–—to]+\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)[a-z]*\.?\s*\d{0,4}/i;
      const yearRange = /\b(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)\b/i;

      const hasDate = datePattern.test(line) || yearRange.test(line);

      // Lines with dates or lines that look like job titles (short, no bullet)
      if (
        hasDate ||
        (line.length < 80 &&
          !line.startsWith("•") &&
          !line.startsWith("-") &&
          !line.startsWith("*") &&
          currentExp === null)
      ) {
        if (
          hasDate ||
          (!line.startsWith("•") &&
            !line.startsWith("-") &&
            !line.startsWith("*") &&
            line.length < 80)
        ) {
          // Push previous entry
          if (currentExp) resume.experience.push(currentExp);

          // Extract dates from line
          let startDate = "";
          let endDate = "";
          const dm = line.match(datePattern) || line.match(yearRange);
          if (dm) {
            const parts = dm[0].split(/[-–—]|to/i).map((p) => p.trim());
            startDate = parts[0] || "";
            endDate = parts[1] || "";
          }

          // Title and company: try to split by " at ", " - ", " | "
          const titleLine = line.replace(datePattern, "").replace(yearRange, "").trim();
          const splitMatch = titleLine.match(/^(.+?)(?:\s+at\s+|\s*[-|]\s*)(.+)$/i);

          currentExp = {
            title: splitMatch ? splitMatch[1].trim() : titleLine,
            company: splitMatch ? splitMatch[2].trim() : "",
            startDate,
            endDate,
            current: /present|current/i.test(endDate),
            bullets: [],
          };
        }
      } else if (currentExp) {
        // Bullet point
        const bullet = line.replace(/^[•\-*▪●]\s*/, "").trim();
        if (bullet.length > 5) {
          currentExp.bullets.push(bullet);
        }
      }
    }
    if (currentExp) resume.experience.push(currentExp);
  }

  // --- Parse education ---
  if (sections.education) {
    let currentEdu = null;

    for (const line of sections.education) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const gpaMatch = line.match(/(?:gpa|cgpa)[:\s]*([0-9.]+)/i);

      // Detect degree keywords
      const isDegree =
        /\b(b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|ph\.?d|bachelor|master|associate|diploma|mba|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?)\b/i.test(
          line
        );

      if (isDegree || (line.length < 100 && !currentEdu)) {
        if (currentEdu) resume.education.push(currentEdu);
        currentEdu = {
          degree: line.replace(/\b(19|20)\d{2}\b/, "").trim(),
          institution: "",
          year: yearMatch ? yearMatch[0] : "",
          gpa: gpaMatch ? gpaMatch[1] : "",
        };
      } else if (currentEdu && !currentEdu.institution) {
        currentEdu.institution = line;
        if (yearMatch && !currentEdu.year) currentEdu.year = yearMatch[0];
        if (gpaMatch && !currentEdu.gpa) currentEdu.gpa = gpaMatch[1];
      }
    }
    if (currentEdu) resume.education.push(currentEdu);
  }

  // --- Parse projects ---
  if (sections.projects) {
    let currentProj = null;

    for (const line of sections.projects) {
      const isBullet =
        line.startsWith("•") ||
        line.startsWith("-") ||
        line.startsWith("*");
      const linkMatch = line.match(/https?:\/\/[^\s]+/);

      if (!isBullet && line.length < 80) {
        if (currentProj) resume.projects.push(currentProj);
        currentProj = {
          name: line,
          description: "",
          technologies: [],
          link: linkMatch ? linkMatch[0] : "",
        };
      } else if (currentProj) {
        const bullet = line.replace(/^[•\-*]\s*/, "").trim();
        if (currentProj.description) {
          currentProj.description += " " + bullet;
        } else {
          currentProj.description = bullet;
        }
        if (linkMatch) currentProj.link = linkMatch[0];
      }
    }
    if (currentProj) resume.projects.push(currentProj);
  }

  // --- Parse certifications ---
  if (sections.certifications) {
    for (const line of sections.certifications) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const parts = line.split(/[-–—|,]/).map((p) => p.trim());
      resume.certifications.push({
        name: parts[0] || line,
        issuer: parts[1] || "",
        year: yearMatch ? yearMatch[0] : "",
      });
    }
  }

  return resume;
}

module.exports = { parseFile, textToResumeJson };
