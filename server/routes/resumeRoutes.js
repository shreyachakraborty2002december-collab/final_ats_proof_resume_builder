const express = require("express");
const multer = require("multer");
const router = express.Router();

const { parseFile, textToResumeJson } = require("../services/resumeParser");
const { gradeResume } = require("../services/resumeGrader");
const { matchJobs } = require("../services/jobMatcher");
const {
  enhanceResume,
  explainImprovements,
  suggestRolesAI,
} = require("../services/aiService");
const { normalizeResume } = require("../schemas/resumeSchema");
const {
  resumeBodyRules,
  handleValidationErrors,
  validateFileUpload,
} = require("../middleware/validate");

// Multer: in-memory storage, 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─── Helper: safe JSON body check ───────────────────────────────────────────
function requireBody(req, res) {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ error: "Request body must be a JSON object" });
    return false;
  }
  if (!req.body.personalInfo || typeof req.body.personalInfo !== "object") {
    res.status(400).json({ error: "personalInfo object is required" });
    return false;
  }
  return true;
}

/**
 * POST /api/parse-resume
 * Upload a PDF/DOCX file → extract text → return normalized resume JSON
 */
router.post(
  "/parse-resume",
  upload.single("resume"),
  validateFileUpload,
  async (req, res, next) => {
    try {
      const rawText = await parseFile(req.file.buffer, req.file.mimetype);

      if (!rawText || rawText.trim().length < 20) {
        return res.status(422).json({
          error:
            "Could not extract meaningful text from the file. Ensure the PDF/DOCX has selectable text (not a scanned image).",
        });
      }

      const resumeJson = textToResumeJson(rawText);
      const normalized = normalizeResume(resumeJson);

      res.json({
        success: true,
        resume: normalized,
        rawTextLength: rawText.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/generate-resume
 * Accepts resume JSON → normalizes → optionally enhances via AI
 */
router.post("/generate-resume", async (req, res, next) => {
  try {
    if (!requireBody(req, res)) return;

    const normalized = normalizeResume(req.body);

    // Try AI enhancement, falls back gracefully to original data
    const { enhanced, resume } = await enhanceResume(normalized);

    res.json({
      success: true,
      enhanced,
      resume: normalizeResume(resume),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/grade-resume
 * Accepts resume JSON → rule-based ATS grading → optional AI explanations
 */
router.post("/grade-resume", async (req, res, next) => {
  try {
    if (!requireBody(req, res)) return;

    const normalized = normalizeResume(req.body);

    // Rule-based grading (always runs, no AI key needed)
    const gradeResult = gradeResume(normalized);

    // AI-enhanced improvement explanations (optional, falls back if no key)
    const { enhanced, improvements } = await explainImprovements(gradeResult);

    res.json({
      success: true,
      atsScore: gradeResult.atsScore,
      breakdown: gradeResult.breakdown,
      improvements,
      aiEnhanced: enhanced,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/suggest-jobs
 * Accepts resume JSON → keyword matching against 50+ roles → optional AI enrichment
 */
router.post("/suggest-jobs", async (req, res, next) => {
  try {
    if (!requireBody(req, res)) return;

    const normalized = normalizeResume(req.body);

    // Rule-based job matching (always runs)
    const matchResult = matchJobs(normalized);

    // AI-enriched suggestions (optional, falls back if no key)
    const aiResult = await suggestRolesAI(normalized, matchResult);

    res.json({
      success: true,
      bestFitRoles: matchResult.bestFitRoles,
      missingSkills: matchResult.missingSkills,
      detectedSeniority: matchResult.detectedSeniority,
      aiInsights: aiResult.enhanced
        ? {
            roleInsights: aiResult.roleInsights,
            careerAdvice: aiResult.careerAdvice,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
