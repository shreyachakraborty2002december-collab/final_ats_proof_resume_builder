/**
 * Cover Letter Routes
 * POST /api/cover-letter/generate
 */
const express = require('express');
const router  = express.Router();

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt({ jobInfo, resumeData, manualData }) {
  const {
    company     = '',
    recipient   = 'Hiring Manager',
    title       = '',
    description = '',
    tone        = 'professional',
    length      = 'medium',
  } = jobInfo;

  const wordTarget =
    length === 'short'  ? '150–200 words' :
    length === 'medium' ? '250–320 words' :
                          '380–450 words';

  const toneNote =
    tone === 'formal'       ? 'Use a formal, corporate tone.' :
    tone === 'enthusiastic' ? 'Use an enthusiastic, energetic tone showing genuine excitement.' :
    tone === 'conversational' ? 'Use a warm, conversational yet professional tone.' :
                                'Use a confident, clear professional tone.';

  // Build candidate profile section
  let candidateProfile = '';

  if (resumeData && (resumeData.personalInfo?.name || resumeData.experience?.length)) {
    const { personalInfo: pi = {}, summary = '', skills = [], experience = [], education = [], projects = [] } = resumeData;
    candidateProfile = `
CANDIDATE PROFILE (from parsed resume):
Name: ${pi.name || 'Not specified'}
Email: ${pi.email || ''}
Phone: ${pi.phone || ''}
Location: ${pi.location || ''}
LinkedIn: ${pi.linkedin || ''}

Professional Summary:
${summary || 'Not provided'}

Key Skills: ${skills.slice(0, 15).join(', ') || 'Not specified'}

Work Experience:
${experience.slice(0, 4).map(e =>
  `- ${e.title || ''} at ${e.company || ''} (${e.startDate || ''}${e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''})
   ${(e.bullets || []).slice(0, 3).join(' | ')}`
).join('\n') || 'Not provided'}

Education:
${education.slice(0, 2).map(e => `- ${e.degree || ''} from ${e.institution || ''} (${e.year || ''})`).join('\n') || 'Not provided'}

Notable Projects:
${projects.slice(0, 3).map(p => `- ${p.name || ''}: ${p.description || ''}`).join('\n') || 'None listed'}
`;
  } else if (manualData) {
    const {
      skills = '', experience = '', education = '',
      projects = '', achievements = '', currentRole = '', highlights = '',
    } = manualData;
    candidateProfile = `
CANDIDATE PROFILE (manually entered):
Current Role / Situation: ${currentRole}
Skills: ${skills}
Experience Summary: ${experience}
Education: ${education}
Projects: ${projects}
Achievements: ${achievements}
Additional Highlights: ${highlights}
`;
  }

  return `You are a professional cover letter writer. Write a compelling, tailored cover letter.

JOB DETAILS:
Company: ${company}
Recipient: ${recipient}
Position: ${title}
Job Description:
${description}

${candidateProfile}

INSTRUCTIONS:
- ${toneNote}
- Target length: ${wordTarget}
- Open with a strong hook, do NOT start with "I am writing to apply…"
- Reference specific skills from the candidate profile that match the job description
- Highlight 2–3 concrete achievements or relevant experience points
- Close with a confident call to action
- Do NOT include a subject line or date header — only the letter body
- Do NOT include placeholder text in brackets
- Format: date greeting, 3–4 paragraphs, sign-off with candidate name (use resume name if available, else "Your Name")
- Return ONLY the letter text, nothing else.`;
}

// ── Try Gemini (falls back to template) ──────────────────────────────────────
async function generateWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    }),
  });

  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Template fallback ─────────────────────────────────────────────────────────
function templateFallback({ jobInfo, resumeData, manualData }) {
  const {
    company   = '[Company Name]',
    recipient = 'Hiring Manager',
    title     = '[Position]',
  } = jobInfo;

  const name =
    resumeData?.personalInfo?.name ||
    manualData?.currentRole?.split(' ').slice(-2).join(' ') ||
    'Your Name';

  const topSkill =
    (resumeData?.skills || [])[0] ||
    (manualData?.skills || '').split(',')[0]?.trim() ||
    'relevant skills';

  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${today}

Dear ${recipient},

I am excited to apply for the ${title} position at ${company}. With my background in ${topSkill} and a strong track record of delivering impactful results, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed a deep understanding of the skills and mindset required to excel in this role. I bring a combination of technical expertise and collaborative problem-solving ability that aligns well with what ${company} values.

I would welcome the opportunity to discuss how my experience can contribute to your team's goals. Thank you for considering my application — I look forward to speaking with you.

Sincerely,
${name}`;
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.post('/generate', async (req, res, next) => {
  try {
    const { jobInfo, resumeData, manualData } = req.body;

    if (!jobInfo?.company && !jobInfo?.title) {
      return res.status(400).json({ error: 'At least company or job title is required.' });
    }

    const prompt = buildPrompt({ jobInfo, resumeData, manualData });

    let text = await generateWithGemini(prompt);
    const aiEnhanced = !!text;

    if (!text) {
      text = templateFallback({ jobInfo, resumeData, manualData });
    }

    res.json({ success: true, coverLetter: text.trim(), aiEnhanced });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
