# ResumeAI — AI-Powered Resume Builder

A full-stack AI resume builder that generates ATS-friendly resumes, grades uploaded resumes, and suggests best-fit job roles.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + JavaScript |
| Backend | Node.js + Express 5 |
| AI | Google Gemini 2.0 Flash (free tier) |
| PDF | html2pdf.js (client-side) |
| File Parsing | pdf-parse + mammoth |

## Architecture

```
┌─────────────────────────────────┐
│           React Client          │
│ Form → Preview → Download PDF   │
│ FileUpload → Grade → Jobs       │
└──────────┬──────────────────────┘
           │ /api/* (Vite proxy)
┌──────────▼──────────────────────┐
│        Express Backend          │
│ Rule-based engine (always runs) │
│ AI enhancement (optional)       │
│ Graceful fallback if no API key │
└─────────────────────────────────┘
```

## Quick Start

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy the env template
cp server/.env.example server/.env

# Edit server/.env and add your Gemini API key (optional)
# The app works fully without it using rule-based logic
```

Get a free Gemini API key at: https://aistudio.google.com/apikey

### 3. Run

```bash
# Start both client and server concurrently
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## API Endpoints

### POST `/api/parse-resume`
Upload a PDF/DOCX file → returns normalized resume JSON.

**Request**: `multipart/form-data` with field `resume`

**Response**:
```json
{
  "success": true,
  "resume": { "personalInfo": {...}, "skills": [...], ... },
  "rawTextLength": 2450
}
```

### POST `/api/generate-resume`
Accepts resume JSON → validates → optionally enhances via AI.

**Request**:
```json
{
  "personalInfo": { "name": "John", "email": "john@email.com", ... },
  "summary": "...",
  "skills": ["JavaScript", "React"],
  "experience": [{ "title": "...", "company": "...", "bullets": [...] }],
  "education": [...],
  "projects": [...],
  "certifications": [...]
}
```

**Response**:
```json
{
  "success": true,
  "enhanced": true,
  "resume": { ... }
}
```

### POST `/api/grade-resume`
Rule-based ATS scoring + optional AI improvement explanations.

**Request**: Same resume JSON as above.

**Response**:
```json
{
  "success": true,
  "atsScore": 72,
  "breakdown": {
    "contact": { "score": 85, "weight": 10, "label": "Contact Info" },
    "summary": { "score": 60, "weight": 15, "label": "Professional Summary" },
    ...
  },
  "improvements": [
    { "category": "Experience", "issue": "...", "suggestion": "...", "priority": "high" }
  ],
  "aiEnhanced": true
}
```

### POST `/api/suggest-jobs`
Keyword matching + optional AI career insights.

**Request**: Same resume JSON.

**Response**:
```json
{
  "success": true,
  "bestFitRoles": [
    {
      "title": "Full Stack Developer",
      "category": "Engineering",
      "matchScore": 82,
      "matchedKeywords": ["react", "node.js", ...],
      "missingKeywords": ["kubernetes", ...]
    }
  ],
  "missingSkills": ["docker", "kubernetes"],
  "detectedSeniority": "mid",
  "aiInsights": { "roleInsights": [...], "careerAdvice": "..." }
}
```

## Resume JSON Schema

```json
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string"
  },
  "summary": "string",
  "skills": ["string"],
  "experience": [{
    "title": "string",
    "company": "string",
    "startDate": "string",
    "endDate": "string",
    "current": false,
    "bullets": ["string"]
  }],
  "education": [{
    "degree": "string",
    "institution": "string",
    "year": "string",
    "gpa": "string"
  }],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"],
    "link": "string"
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "year": "string"
  }]
}
```

## Scoring Categories

| Category | Weight | What it Checks |
|----------|--------|---------------|
| Contact Info | 10% | Name, email, phone, LinkedIn, location |
| Professional Summary | 15% | Length, tone, quantified claims |
| Skills | 20% | Count, relevance, uniqueness |
| Experience | 25% | Impact verbs, metrics, bullet count |
| Education | 10% | Degree, institution, year |
| Formatting | 10% | Section completeness, structure |
| ATS Keywords | 10% | Industry keyword density |

## AI Provider

The app uses **Google Gemini** by default but is designed for easy provider swapping:

- Edit `server/services/aiService.js` to add new providers
- Set `AI_PROVIDER` in `.env` to switch
- All AI calls go through a single `getProvider()` abstraction
- The app works **fully without an API key** using rule-based logic

## Project Structure

```
├── client/                     # Vite + React frontend
│   └── src/
│       ├── api/resumeApi.js    # API fetch layer
│       ├── components/         # All UI components
│       ├── App.jsx             # Main app + state
│       ├── App.css             # Layout styles
│       └── index.css           # Design system
├── server/                     # Express backend
│   ├── index.js                # Entry point
│   ├── schemas/                # Resume JSON schema
│   ├── middleware/              # Validation
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   │   ├── resumeParser.js     # PDF/DOCX → JSON
│   │   ├── resumeGrader.js     # Rule-based ATS scoring
│   │   ├── jobMatcher.js       # Role matching engine
│   │   ├── aiService.js        # AI abstraction layer
│   │   └── promptTemplates.js  # LLM prompts
│   └── data/                   # Sample data
└── package.json                # Root (concurrently)
```

## License

MIT
