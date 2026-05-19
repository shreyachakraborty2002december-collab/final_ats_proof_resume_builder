const { body, validationResult } = require("express-validator");

/**
 * Middleware: runs validation result check and returns 400 on failures.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
}

/**
 * Validation chains for resume JSON body endpoints.
 * Relaxed: only require personalInfo to be an object — skills/experience
 * may be empty on grade/suggest calls (partial resumes are valid).
 */
const resumeBodyRules = [
  body("personalInfo")
    .isObject()
    .withMessage("personalInfo must be an object"),
];

/**
 * Stricter validation for generate-resume only — needs name to personalize output.
 */
const generateBodyRules = [
  body("personalInfo")
    .isObject()
    .withMessage("personalInfo must be an object"),
  body("personalInfo.name")
    .optional()
    .trim(),
];

/**
 * Validation for file upload — checked manually since multer runs first.
 */
function validateFileUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded. Send a PDF or DOCX as 'resume' field." });
  }

  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: "Invalid file type. Only .pdf and .docx files are accepted.",
    });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: "File size must be under 5MB." });
  }

  next();
}

module.exports = {
  handleValidationErrors,
  resumeBodyRules,
  generateBodyRules,
  validateFileUpload,
};
