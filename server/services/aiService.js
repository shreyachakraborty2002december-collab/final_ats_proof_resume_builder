/**
 * AI Service — Provider-agnostic abstraction layer
 *
 * Supports: Google Gemini (default), with easy swap to OpenAI/Anthropic.
 * Falls back gracefully to rule-based results when no API key is configured.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  REWRITE_BULLETS_PROMPT,
  IMPROVE_SUMMARY_PROMPT,
  EXPLAIN_IMPROVEMENTS_PROMPT,
  SUGGEST_ROLES_PROMPT,
  fillTemplate,
} = require("./promptTemplates");

// --- Provider registry ---

function getProvider() {
  const provider = process.env.AI_PROVIDER || "gemini";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("[AI] No API key configured — using rule-based fallback");
    return null;
  }

  if (provider === "gemini") {
    return createGeminiProvider(apiKey);
  }

  // Add more providers here:
  // if (provider === "openai") return createOpenAIProvider(apiKey);
  // if (provider === "anthropic") return createAnthropicProvider(apiKey);

  console.warn(`[AI] Unknown provider "${provider}" — using fallback`);
  return null;
}

function createGeminiProvider(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);

  // Try the latest flash model; if it errors we fall back in parseJsonResponse
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
  });

  return {
    name: "gemini",
    async generate(prompt) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("[AI Gemini] Raw response (first 300 chars):", text.slice(0, 300));
        return parseJsonResponse(text);
      } catch (err) {
        console.error("[AI Gemini] Error:", err.message);
        return null;
      }
    },
  };
}

/**
 * Parse AI response text into JSON.
 * Handles: markdown fences, extra prose before/after JSON, single-quote JSON.
 */
function parseJsonResponse(text) {
  if (!text) return null;
  try {
    let cleaned = text.trim();

    // 1. Try direct parse first (fastest path)
    try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }

    // 2. Strip markdown code fences  ```json … ``` or ``` … ```
    const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      try { return JSON.parse(fenceMatch[1].trim()); } catch (_) { /* fall through */ }
    }

    // 3. Extract first {...} or [...] block from the response
    const objMatch = cleaned.match(/(\{[\s\S]*\})/);
    if (objMatch) {
      try { return JSON.parse(objMatch[1]); } catch (_) { /* fall through */ }
    }

    const arrMatch = cleaned.match(/(\[[\s\S]*\])/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[1]); } catch (_) { /* fall through */ }
    }

    console.error("[AI] Could not extract JSON from response:", cleaned.slice(0, 200));
    return null;
  } catch (err) {
    console.error("[AI] parseJsonResponse error:", err.message);
    return null;
  }
}


// --- Public API ---

/**
 * Enhance resume bullets and summary using AI.
 * Falls back to original data if AI is unavailable.
 */
async function enhanceResume(resumeData) {
  const provider = getProvider();
  if (!provider) {
    return { enhanced: false, resume: resumeData };
  }

  try {
    // Rewrite experience bullets
    const bulletsPrompt = fillTemplate(REWRITE_BULLETS_PROMPT, {
      experience: JSON.stringify(resumeData.experience, null, 2),
    });
    const bulletsResult = await provider.generate(bulletsPrompt);

    // Improve summary
    const currentRole =
      resumeData.experience?.[0]?.title || "Professional";
    const yearsExp = estimateYears(resumeData.experience);
    const summaryPrompt = fillTemplate(IMPROVE_SUMMARY_PROMPT, {
      currentRole,
      skills: resumeData.skills.slice(0, 10).join(", "),
      yearsExp: yearsExp || "N/A",
      currentSummary: resumeData.summary || "None",
    });
    const summaryResult = await provider.generate(summaryPrompt);

    const enhanced = { ...resumeData };
    if (bulletsResult?.experience) {
      enhanced.experience = bulletsResult.experience;
    }
    if (summaryResult?.summary) {
      enhanced.summary = summaryResult.summary;
    }

    return { enhanced: true, resume: enhanced };
  } catch (err) {
    console.error("[AI] Enhancement failed:", err.message);
    return { enhanced: false, resume: resumeData };
  }
}

/**
 * Get AI-powered improvement explanations for grading results.
 * Falls back to the original rule-based improvements array.
 */
async function explainImprovements(gradeResult) {
  const provider = getProvider();
  if (!provider) {
    return {
      enhanced: false,
      improvements: gradeResult.improvements.map((imp) => ({
        category: "General",
        issue: imp,
        suggestion: imp,
        priority: "medium",
      })),
    };
  }

  try {
    const prompt = fillTemplate(EXPLAIN_IMPROVEMENTS_PROMPT, {
      atsScore: gradeResult.atsScore,
      improvements: JSON.stringify(gradeResult.improvements),
      breakdown: JSON.stringify(gradeResult.breakdown, null, 2),
    });

    const result = await provider.generate(prompt);
    if (result?.improvements) {
      return { enhanced: true, improvements: result.improvements };
    }
  } catch (err) {
    console.error("[AI] Improvement explanation failed:", err.message);
  }

  return {
    enhanced: false,
    improvements: gradeResult.improvements.map((imp) => ({
      category: "General",
      issue: imp,
      suggestion: imp,
      priority: "medium",
    })),
  };
}

/**
 * Get AI-enriched job role suggestions.
 * Falls back to rule-based match data.
 */
async function suggestRolesAI(resumeData, matchResult) {
  const provider = getProvider();
  if (!provider) {
    return { enhanced: false, roleInsights: [], careerAdvice: "" };
  }

  try {
    const prompt = fillTemplate(SUGGEST_ROLES_PROMPT, {
      skills: resumeData.skills.slice(0, 15).join(", "),
      seniority: matchResult.detectedSeniority,
      matchedRoles: JSON.stringify(
        matchResult.bestFitRoles.slice(0, 3).map((r) => r.title)
      ),
      missingSkills: JSON.stringify(matchResult.missingSkills),
    });

    const result = await provider.generate(prompt);
    if (result?.roleInsights) {
      return { enhanced: true, ...result };
    }
  } catch (err) {
    console.error("[AI] Role suggestion failed:", err.message);
  }

  return { enhanced: false, roleInsights: [], careerAdvice: "" };
}

// --- Helpers ---

function estimateYears(experience) {
  if (!experience?.length) return 0;
  const currentYear = new Date().getFullYear();
  let total = 0;
  for (const exp of experience) {
    const startMatch = exp.startDate?.match(/\b(19|20)\d{2}\b/);
    const endMatch = exp.current
      ? null
      : exp.endDate?.match(/\b(19|20)\d{2}\b/);
    const start = startMatch ? parseInt(startMatch[0]) : null;
    const end = exp.current
      ? currentYear
      : endMatch
        ? parseInt(endMatch[0])
        : currentYear;
    if (start) total += Math.max(0, end - start);
  }
  return total;
}

module.exports = { enhanceResume, explainImprovements, suggestRolesAI };
