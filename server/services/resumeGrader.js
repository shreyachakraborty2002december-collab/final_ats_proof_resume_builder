/**
 * Rule-based ATS Resume Grader
 *
 * Scores a resume across 7 weighted categories before any AI call.
 * Returns a numeric score (0-100) plus per-category breakdown and improvement suggestions.
 */

// --- Impact verbs that ATS and recruiters look for ---
const IMPACT_VERBS = [
  "achieved", "accelerated", "accomplished", "administered", "advanced",
  "analyzed", "architected", "automated", "boosted", "built", "collaborated",
  "consolidated", "coordinated", "created", "decreased", "delivered",
  "designed", "developed", "directed", "drove", "eliminated", "engineered",
  "established", "evaluated", "exceeded", "executed", "expanded", "generated",
  "grew", "implemented", "improved", "increased", "initiated", "integrated",
  "introduced", "launched", "led", "managed", "maximized", "mentored",
  "migrated", "minimized", "modernized", "negotiated", "operated", "optimized",
  "orchestrated", "organized", "overhauled", "pioneered", "planned",
  "produced", "programmed", "reduced", "refactored", "resolved", "revamped",
  "scaled", "secured", "simplified", "spearheaded", "streamlined",
  "strengthened", "supervised", "transformed", "upgraded",
];

// --- Common ATS keywords across industries ---
const ATS_KEYWORDS = [
  "project management", "agile", "scrum", "leadership", "communication",
  "problem solving", "data analysis", "machine learning", "cloud",
  "devops", "ci/cd", "database", "sql", "api", "rest", "microservices",
  "security", "testing", "automation", "performance", "scalable",
  "cross-functional", "stakeholder", "budget", "kpi", "metrics",
  "revenue", "customer", "strategy", "compliance", "documentation",
];

/**
 * Main grading function.
 * @param {Object} resume - Normalized resume JSON
 * @returns {{ atsScore: number, breakdown: Object, improvements: string[] }}
 */
function gradeResume(resume) {
  const breakdown = {};
  const improvements = [];

  // 1. Contact Completeness (10%)
  const contactScore = gradeContact(resume.personalInfo, improvements);
  breakdown.contact = { score: contactScore, weight: 10, label: "Contact Info" };

  // 2. Summary Quality (15%)
  const summaryScore = gradeSummary(resume.summary, improvements);
  breakdown.summary = { score: summaryScore, weight: 15, label: "Professional Summary" };

  // 3. Skills Relevance (20%)
  const skillsScore = gradeSkills(resume.skills, improvements);
  breakdown.skills = { score: skillsScore, weight: 20, label: "Skills" };

  // 4. Experience Quality (25%)
  const expScore = gradeExperience(resume.experience, improvements);
  breakdown.experience = { score: expScore, weight: 25, label: "Experience" };

  // 5. Education (10%)
  const eduScore = gradeEducation(resume.education, improvements);
  breakdown.education = { score: eduScore, weight: 10, label: "Education" };

  // 6. Formatting & Structure (10%)
  const formatScore = gradeFormatting(resume, improvements);
  breakdown.formatting = { score: formatScore, weight: 10, label: "Formatting & Structure" };

  // 7. Keyword Density (10%)
  const keywordScore = gradeKeywords(resume, improvements);
  breakdown.keywords = { score: keywordScore, weight: 10, label: "ATS Keywords" };

  // Weighted total
  const atsScore = Math.round(
    Object.values(breakdown).reduce(
      (sum, cat) => sum + (cat.score / 100) * cat.weight,
      0
    )
  );

  return { atsScore, breakdown, improvements };
}

// --- Category graders ---

function gradeContact(info, improvements) {
  let score = 0;
  if (info.name?.trim()) score += 25;
  else improvements.push("Add your full name");

  if (info.email?.trim()) score += 25;
  else improvements.push("Add a professional email address");

  if (info.phone?.trim()) score += 25;
  else improvements.push("Add a phone number");

  if (info.linkedin?.trim()) score += 15;
  else improvements.push("Add your LinkedIn profile URL");

  if (info.location?.trim()) score += 10;
  else improvements.push("Add your city/location");

  return Math.min(score, 100);
}

function gradeSummary(summary, improvements) {
  if (!summary || !summary.trim()) {
    improvements.push(
      "Add a professional summary (2-4 sentences describing your value proposition)"
    );
    return 0;
  }

  let score = 40; // has a summary at all
  const wordCount = summary.trim().split(/\s+/).length;

  if (wordCount >= 20 && wordCount <= 80) {
    score += 30;
  } else if (wordCount < 20) {
    improvements.push(
      "Expand your summary to at least 20 words — briefly describe your experience and key strengths"
    );
  } else {
    improvements.push(
      "Shorten your summary to under 80 words — keep it concise and impactful"
    );
  }

  // No first-person pronouns (ATS best practice)
  if (!/\b(I|my|me|myself)\b/i.test(summary)) {
    score += 15;
  } else {
    improvements.push(
      "Remove first-person pronouns (I, my, me) from your summary — use professional third-person tone"
    );
  }

  // Contains quantifiable claims or keywords
  if (/\d+/.test(summary)) {
    score += 15;
  } else {
    improvements.push(
      "Add quantifiable achievements to your summary (e.g., '5+ years experience', 'managed 10-person team')"
    );
  }

  return Math.min(score, 100);
}

function gradeSkills(skills, improvements) {
  if (!skills || skills.length === 0) {
    improvements.push("Add at least 5-10 relevant skills");
    return 0;
  }

  let score = 20;

  if (skills.length >= 5) score += 20;
  else improvements.push("Add more skills — aim for at least 5-10 relevant skills");

  if (skills.length >= 8) score += 15;
  if (skills.length >= 12) score += 10;

  // Check for very short/vague skills
  const vague = skills.filter((s) => s.length < 3);
  if (vague.length === 0) score += 15;
  else improvements.push("Remove vague or single-letter skills entries");

  // Diversity: check if skills aren't all the same length (likely copy-paste issue)
  const uniqueSkills = new Set(skills.map((s) => s.toLowerCase()));
  if (uniqueSkills.size === skills.length) score += 20;
  else improvements.push("Remove duplicate skills");

  return Math.min(score, 100);
}

function gradeExperience(experience, improvements) {
  if (!experience || experience.length === 0) {
    improvements.push("Add at least one work experience entry");
    return 0;
  }

  let score = 15;

  // Has multiple experiences
  if (experience.length >= 2) score += 10;
  if (experience.length >= 3) score += 5;

  // Check each experience entry
  let totalBullets = 0;
  let impactVerbCount = 0;
  let quantifiedBullets = 0;
  let hasCompany = 0;
  let hasDates = 0;

  for (const exp of experience) {
    if (exp.company?.trim()) hasCompany++;
    if (exp.startDate?.trim()) hasDates++;
    totalBullets += exp.bullets?.length || 0;

    for (const bullet of exp.bullets || []) {
      const firstWord = bullet.split(/\s+/)[0]?.toLowerCase();
      if (IMPACT_VERBS.includes(firstWord)) impactVerbCount++;
      if (/\d+%?/.test(bullet)) quantifiedBullets++;
    }
  }

  // Bullets per experience
  const avgBullets = totalBullets / experience.length;
  if (avgBullets >= 3) score += 15;
  else if (avgBullets >= 2) score += 10;
  else
    improvements.push(
      "Add 3-5 bullet points per experience describing your achievements"
    );

  // Impact verbs
  if (totalBullets > 0) {
    const impactRatio = impactVerbCount / totalBullets;
    if (impactRatio >= 0.5) score += 20;
    else if (impactRatio >= 0.25) score += 10;
    else
      improvements.push(
        "Start bullet points with strong action verbs (e.g., 'Developed', 'Led', 'Increased', 'Optimized')"
      );
  }

  // Quantified achievements
  if (totalBullets > 0) {
    const quantRatio = quantifiedBullets / totalBullets;
    if (quantRatio >= 0.3) score += 15;
    else
      improvements.push(
        "Add quantifiable metrics to your bullets (e.g., 'Increased revenue by 25%', 'Reduced load time by 40%')"
      );
  }

  // Company names present
  if (hasCompany === experience.length) score += 10;
  else improvements.push("Include company names for all experience entries");

  // Dates present
  if (hasDates === experience.length) score += 10;
  else improvements.push("Include start/end dates for all experience entries");

  return Math.min(score, 100);
}

function gradeEducation(education, improvements) {
  if (!education || education.length === 0) {
    improvements.push("Add your education background");
    return 30; // Not fatal, some experienced candidates omit
  }

  let score = 40;

  for (const edu of education) {
    if (edu.degree?.trim()) score += 20;
    else improvements.push("Specify your degree (e.g., B.S. Computer Science)");

    if (edu.institution?.trim()) score += 20;
    else improvements.push("Include your institution name");

    if (edu.year?.trim()) score += 20;
    else improvements.push("Include your graduation year");
  }

  return Math.min(score, 100);
}

function gradeFormatting(resume, improvements) {
  let score = 30; // base score for having structured data

  // Check section completeness
  const sections = [
    resume.summary,
    resume.skills?.length,
    resume.experience?.length,
    resume.education?.length,
  ];
  const filledSections = sections.filter(Boolean).length;
  score += filledSections * 10;

  // Bonus for projects
  if (resume.projects?.length > 0) score += 10;
  else
    improvements.push(
      "Consider adding a Projects section to showcase hands-on work"
    );

  // Bonus for certifications
  if (resume.certifications?.length > 0) score += 10;

  return Math.min(score, 100);
}

function gradeKeywords(resume, improvements) {
  // Flatten all resume text for keyword matching
  const allText = [
    resume.summary,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((e) => [
      e.title,
      ...(e.bullets || []),
    ]),
    ...(resume.projects || []).map((p) => p.description),
  ]
    .join(" ")
    .toLowerCase();

  let found = 0;
  const missing = [];

  for (const keyword of ATS_KEYWORDS) {
    if (allText.includes(keyword.toLowerCase())) {
      found++;
    }
  }

  const ratio = found / ATS_KEYWORDS.length;
  let score;

  if (ratio >= 0.3) score = 100;
  else if (ratio >= 0.2) score = 75;
  else if (ratio >= 0.1) score = 50;
  else score = 25;

  if (ratio < 0.15) {
    improvements.push(
      "Include more industry-standard keywords in your resume to improve ATS matching"
    );
  }

  return score;
}

module.exports = { gradeResume, IMPACT_VERBS, ATS_KEYWORDS };
