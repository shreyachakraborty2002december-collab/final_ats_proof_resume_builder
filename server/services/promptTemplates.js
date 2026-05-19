/**
 * Prompt Templates for AI Enhancement
 *
 * All prompts enforce strict JSON output and are designed to be token-efficient.
 * Each prompt receives pre-processed data to minimize AI workload.
 */

const REWRITE_BULLETS_PROMPT = `You are a professional resume writer. Rewrite the following experience bullet points to be more impactful, ATS-friendly, and results-oriented.

Rules:
- Start each bullet with a strong action verb
- Include quantifiable metrics where possible (estimate if needed)
- Keep each bullet under 25 words
- Use professional tone, no first-person pronouns
- Maintain the original meaning

Input experience:
{experience}

Return ONLY valid JSON in this exact format:
{
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["string"]
    }
  ]
}`;

const IMPROVE_SUMMARY_PROMPT = `You are a professional resume writer. Write a compelling professional summary for a resume.

Candidate info:
- Current/recent role: {currentRole}
- Skills: {skills}
- Years of experience: {yearsExp}
- Current summary (if any): {currentSummary}

Rules:
- Write 2-3 sentences, 30-60 words
- No first-person pronouns (no "I", "my", "me")
- Highlight key strengths and value proposition
- Include years of experience if available
- Make it ATS-friendly with industry keywords
- Professional and confident tone

Return ONLY valid JSON:
{
  "summary": "string"
}`;

const EXPLAIN_IMPROVEMENTS_PROMPT = `You are a career coach reviewing a resume that scored {atsScore}/100.

The rule-based analysis found these issues:
{improvements}

Category breakdown:
{breakdown}

Provide specific, actionable improvement suggestions. Be concise and practical.

Return ONLY valid JSON:
{
  "improvements": [
    {
      "category": "string",
      "issue": "string",
      "suggestion": "string",
      "priority": "high|medium|low"
    }
  ]
}`;

const SUGGEST_ROLES_PROMPT = `You are a career advisor. Based on the candidate's profile and the role matches below, provide career guidance.

Candidate skills: {skills}
Detected seniority: {seniority}
Top matched roles: {matchedRoles}
Missing skills: {missingSkills}

For each of the top 3 roles, provide:
1. Why this role fits the candidate
2. Key skills to develop
3. Estimated salary range (USD)

Return ONLY valid JSON:
{
  "roleInsights": [
    {
      "title": "string",
      "whyFit": "string",
      "skillsToLearn": ["string"],
      "salaryRange": "string"
    }
  ],
  "careerAdvice": "string"
}`;

/**
 * Fill in template placeholders with actual data.
 */
function fillTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    const stringValue =
      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    result = result.replaceAll(placeholder, stringValue);
  }
  return result;
}

module.exports = {
  REWRITE_BULLETS_PROMPT,
  IMPROVE_SUMMARY_PROMPT,
  EXPLAIN_IMPROVEMENTS_PROMPT,
  SUGGEST_ROLES_PROMPT,
  fillTemplate,
};
