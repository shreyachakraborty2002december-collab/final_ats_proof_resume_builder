/**
 * API layer — all backend calls go through here.
 */

const API_BASE = "/api";

async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.details?.join(", ") || "Request failed");
    }

    return data;
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("Cannot connect to server. Please ensure the backend is running.");
    }
    throw err;
  }
}

/**
 * Upload a resume file and get the normalized resume JSON back.
 * Server returns { success, resume, rawTextLength } — we extract .resume
 */
export async function parseResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const data = await apiCall("/parse-resume", {
    method: "POST",
    body: formData,
  });

  // Extract the nested resume object so App.jsx can call setResumeData(result) directly
  return data.resume;
}

/**
 * Send resume data for AI-enhanced generation.
 * Server returns { success, enhanced, resume } — we extract .resume
 */
export async function generateResume(resumeData) {
  const data = await apiCall("/generate-resume", {
    method: "POST",
    body: JSON.stringify(resumeData),
  });

  return data.resume;
}

/**
 * Send resume data for ATS grading.
 * Server returns { success, atsScore, breakdown, improvements, aiEnhanced }
 * We return the full data so GradeResults can access all fields directly.
 */
export async function gradeResume(resumeData) {
  return apiCall("/grade-resume", {
    method: "POST",
    body: JSON.stringify(resumeData),
  });
}

/**
 * Send resume data for job role suggestions.
 * Server returns { success, bestFitRoles, missingSkills, detectedSeniority, aiInsights }
 * We return the full data so JobSuggestions can access all fields directly.
 */
export async function suggestJobs(resumeData) {
  return apiCall("/suggest-jobs", {
    method: "POST",
    body: JSON.stringify(resumeData),
  });
}
