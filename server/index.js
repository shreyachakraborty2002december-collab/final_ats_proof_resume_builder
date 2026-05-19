const express = require("express");
const cors = require("cors");
require("dotenv").config();

const resumeRoutes      = require('./routes/resumeRoutes');
const stripeRoutes      = require('./routes/stripeRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');

const app = express();

// --- Middleware ---
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get("/", (req, res) => {
  res.json({
    message: "Resume Builder API is running",
    endpoints: [
      "POST /api/parse-resume",
      "POST /api/generate-resume",
      "POST /api/grade-resume",
      "POST /api/suggest-jobs",
    ],
  });
});

app.use('/api', resumeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/cover-letter', coverLetterRoutes);

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File size exceeds 5MB limit" });
  }

  if (err.type === "entity.too.large") {
    return res.status(400).json({ error: "Request body too large" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Resume Builder API running on http://localhost:${PORT}`);
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || "gemini (default)"}`);
  console.log(
    `   AI Status: ${
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
        ? "✅ Configured"
        : "⚠️  No API key — rule-based mode only"
    }`
  );
  console.log(`   Endpoints: /api/parse-resume, /api/generate-resume, /api/grade-resume, /api/suggest-jobs\n`);
});