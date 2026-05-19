/**
 * Cover Letter API client
 */

const API_BASE = '/api';

async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please ensure the backend is running.');
    }
    throw err;
  }
}

/**
 * Generate a cover letter.
 * @param {Object} jobInfo     - company, recipient, title, description, tone, length
 * @param {Object} resumeData  - parsed resume object (may be null)
 * @param {Object} manualData  - manual fallback fields (may be null)
 * @returns {{ coverLetter: string, aiEnhanced: boolean }}
 */
export async function generateCoverLetter(jobInfo, resumeData, manualData) {
  const data = await apiCall('/cover-letter/generate', {
    method: 'POST',
    body: JSON.stringify({ jobInfo, resumeData, manualData }),
  });
  return data;
}
