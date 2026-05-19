import { useState, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Sparkles, Download, Copy, RefreshCw, Loader2, Crown,
  ChevronDown, ChevronUp, FileText, CheckCircle, Lock,
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ExpiryWarningBanner from '../components/ExpiryWarningBanner';
import PromoModal from '../components/PromoModal';
import AuthModal from '../components/AuthModal';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { generateCoverLetter } from '../api/coverLetterApi';
import { parseResume } from '../api/resumeApi';
import { incrementCoverLetterDownloadCount } from '../firebase/subscriptionService';
import useSecurityDeterrents from '../hooks/useSecurityDeterrents';
import './CoverLetterPage.css';

const TONES   = ['professional', 'formal', 'enthusiastic', 'conversational'];
const LENGTHS = [
  { value: 'short',  label: 'Short',  hint: '150–200 words' },
  { value: 'medium', label: 'Medium', hint: '250–320 words' },
  { value: 'long',   label: 'Long',   hint: '380–450 words' },
];

const EMPTY_JOB = { company: '', recipient: '', title: '', description: '', tone: 'professional', length: 'medium' };
const EMPTY_MANUAL = { skills: '', experience: '', education: '', projects: '', achievements: '', currentRole: '', highlights: '' };

export default function CoverLetterPage() {
  const { user }     = useAuth();
  const {
    isPro, canDownloadCoverLetter,
    coverLetterDownloadsLeft, coverLetterDownloadsLimit,
  } = useSubscription();

  useSecurityDeterrents();

  // Form state
  const [jobInfo,     setJobInfo]     = useState(EMPTY_JOB);
  const [manualData,  setManualData]  = useState(EMPTY_MANUAL);
  const [showManual,  setShowManual]  = useState(false);
  const [resumeData,  setResumeData]  = useState(null);
  const [isParsing,   setIsParsing]   = useState(false);

  // Output state
  const [coverLetter,  setCoverLetter]  = useState('');
  const [aiEnhanced,   setAiEnhanced]   = useState(false);
  const [generating,   setGenerating]   = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Modals
  const [showPromo, setShowPromo] = useState(false);
  const [showAuth,  setShowAuth]  = useState(false);

  const previewRef = useRef(null);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const setJob = (field, value) => setJobInfo(prev => ({ ...prev, [field]: value }));
  const setManual = (field, value) => setManualData(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = useCallback(async (file) => {
    setIsParsing(true);
    toast.loading('Parsing resume…', { id: 'cl-parse' });
    try {
      const parsed = await parseResume(file);
      setResumeData(parsed);
      setShowManual(false);
      toast.success('Resume imported — using it for cover letter', { id: 'cl-parse' });
    } catch (err) {
      toast.error(err.message || 'Parse failed', { id: 'cl-parse' });
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user)  { setShowAuth(true);  return; }
    if (!isPro) { setShowPromo(true); return; }

    if (!jobInfo.company && !jobInfo.title) {
      toast.error('Enter at least a company name or job title');
      return;
    }

    setGenerating(true);
    toast.loading('Generating cover letter…', { id: 'cl-gen' });

    try {
      const hasManual = Object.values(manualData).some(v => v.trim());
      const result = await generateCoverLetter(
        jobInfo,
        resumeData || null,
        (!resumeData && hasManual) ? manualData : null,
      );
      setCoverLetter(result.coverLetter);
      setAiEnhanced(result.aiEnhanced);
      toast.success(result.aiEnhanced ? 'AI cover letter ready!' : 'Cover letter ready!', { id: 'cl-gen' });
    } catch (err) {
      toast.error(err.message || 'Generation failed', { id: 'cl-gen' });
    } finally {
      setGenerating(false);
    }
  }, [user, isPro, jobInfo, manualData, resumeData]);

  const handleCopy = useCallback(async () => {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [coverLetter]);

  const handleDownload = useCallback(async () => {
    if (!user)  { setShowAuth(true);  return; }
    if (!isPro) { setShowPromo(true); return; }
    if (!canDownloadCoverLetter) {
      toast.error(`Cover letter download limit reached (${coverLetterDownloadsLimit}/30 days).`);
      return;
    }
    if (!coverLetter) { toast.error('Generate a cover letter first'); return; }

    setDownloading(true);
    toast.loading('Generating PDF…', { id: 'cl-pdf' });

    const el = previewRef.current;
    if (!el) { toast.error('Preview element not found', { id: 'cl-pdf' }); setDownloading(false); return; }

    el.classList.add('cl-print-mode');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `cover-letter-${(jobInfo.company || 'draft').replace(/\s+/g, '-').toLowerCase()}.pdf`;
      await html2pdf().set({
        margin:      [15, 18, 15, 18],
        filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();

      await incrementCoverLetterDownloadCount(user.uid);
      toast.success('PDF downloaded!', { id: 'cl-pdf' });
    } catch (err) {
      toast.error('PDF generation failed', { id: 'cl-pdf' });
    } finally {
      el.classList.remove('cl-print-mode');
      setDownloading(false);
    }
  }, [user, isPro, canDownloadCoverLetter, coverLetter, jobInfo.company, coverLetterDownloadsLimit]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="cl-page">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#12122a', color: '#f0f0fa',
          border: '1px solid rgba(168,85,247,0.22)',
          borderRadius: '12px', fontSize: '0.875rem',
          fontFamily: 'var(--font-family)',
        },
      }} />

      <Header onUpgradeClick={() => setShowPromo(true)} />

      <div className="cl-body">
        <Sidebar onUpgradeClick={() => setShowPromo(true)} />

        <main className="cl-main">
          <ExpiryWarningBanner onUpgradeClick={() => setShowPromo(true)} />

          {/* Page title */}
          <div className="cl-page-header">
            <div className="cl-page-title-wrap">
              <div className="cl-page-icon"><FileText size={22} /></div>
              <div>
                <h1 className="cl-page-title">Cover Letter <span className="gradient-text">Generator</span></h1>
                <p className="cl-page-subtitle">
                  AI-powered, tailored cover letters in seconds
                  {isPro && (
                    <span className="cl-dl-badge">
                      {coverLetterDownloadsLeft}/{coverLetterDownloadsLimit} downloads left
                    </span>
                  )}
                </p>
              </div>
            </div>
            {!isPro && (
              <button className="btn cl-pro-gate-btn" onClick={() => setShowPromo(true)} id="btn-cl-upgrade">
                <Crown size={14} /> Unlock with Pro
              </button>
            )}
          </div>

          {/* Two-column workspace */}
          <div className="cl-workspace">
            {/* ── LEFT: Form ── */}
            <section className="cl-form-panel glass-card">

              {/* Resume upload */}
              <div className="cl-section">
                <h2 className="cl-section-title">
                  <span className="cl-section-num">1</span>
                  Your Resume <span className="cl-section-opt">(optional)</span>
                </h2>
                <FileUpload
                  onFileParsed={handleFileUpload}
                  isLoading={isParsing}
                  compact
                />
                {resumeData && (
                  <div className="cl-resume-loaded">
                    <CheckCircle size={13} />
                    <span>Resume loaded: <strong>{resumeData.personalInfo?.name || 'Parsed'}</strong></span>
                    <button className="cl-resume-clear" onClick={() => setResumeData(null)}>Remove</button>
                  </div>
                )}
                {!resumeData && (
                  <button
                    className="cl-manual-toggle"
                    onClick={() => setShowManual(v => !v)}
                  >
                    {showManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {showManual ? 'Hide manual fields' : 'Enter details manually instead'}
                  </button>
                )}
                {!resumeData && showManual && (
                  <div className="cl-manual-fields">
                    <ManualField label="Current Role / Situation" value={manualData.currentRole}
                      onChange={v => setManual('currentRole', v)} placeholder="e.g. Final year CS student, 3 yrs experience as SWE" />
                    <ManualField label="Key Skills" value={manualData.skills}
                      onChange={v => setManual('skills', v)} placeholder="React, Node.js, Python, leadership…" />
                    <ManualField label="Experience Summary" value={manualData.experience}
                      onChange={v => setManual('experience', v)} textarea placeholder="2 yrs at startup, built X feature…" />
                    <ManualField label="Education" value={manualData.education}
                      onChange={v => setManual('education', v)} placeholder="B.Tech CS, IIT Delhi, 2024" />
                    <ManualField label="Projects" value={manualData.projects}
                      onChange={v => setManual('projects', v)} textarea placeholder="Built X — deployed on AWS, 10k users" />
                    <ManualField label="Achievements" value={manualData.achievements}
                      onChange={v => setManual('achievements', v)} placeholder="Winner, Hackathon 2023…" />
                    <ManualField label="Additional Highlights" value={manualData.highlights}
                      onChange={v => setManual('highlights', v)} textarea placeholder="Open source contributor, fluent in English & Hindi…" />
                  </div>
                )}
              </div>

              {/* Job details */}
              <div className="cl-section">
                <h2 className="cl-section-title">
                  <span className="cl-section-num">2</span>
                  Job Details
                </h2>
                <div className="cl-fields-grid">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input className="form-input" placeholder="Google, Infosys, Startup XYZ…"
                      value={jobInfo.company} onChange={e => setJob('company', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hiring Manager / Recipient</label>
                    <input className="form-input" placeholder="Mr. Sharma, Ms. Priya, Hiring Manager"
                      value={jobInfo.recipient} onChange={e => setJob('recipient', e.target.value)} />
                  </div>
                  <div className="form-group cl-full-width">
                    <label className="form-label">Job Title / Role *</label>
                    <input className="form-input" placeholder="Software Engineer, Product Manager…"
                      value={jobInfo.title} onChange={e => setJob('title', e.target.value)} />
                  </div>
                  <div className="form-group cl-full-width">
                    <label className="form-label">Job Description / Posting <span className="cl-section-opt">(paste text)</span></label>
                    <textarea className="form-textarea cl-jd-textarea"
                      placeholder="Paste the job description here for a highly tailored letter…"
                      value={jobInfo.description} onChange={e => setJob('description', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Tone & Length */}
              <div className="cl-section">
                <h2 className="cl-section-title">
                  <span className="cl-section-num">3</span>
                  Style
                </h2>
                <div className="cl-style-row">
                  <div className="form-group">
                    <label className="form-label">Tone</label>
                    <div className="cl-tone-pills">
                      {TONES.map(t => (
                        <button
                          key={t}
                          className={`cl-tone-pill ${jobInfo.tone === t ? 'active' : ''}`}
                          onClick={() => setJob('tone', t)}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Length</label>
                    <div className="cl-length-pills">
                      {LENGTHS.map(l => (
                        <button
                          key={l.value}
                          className={`cl-length-pill ${jobInfo.length === l.value ? 'active' : ''}`}
                          onClick={() => setJob('length', l.value)}
                        >
                          <span>{l.label}</span>
                          <span className="cl-length-hint">{l.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <button
                className="btn btn-primary cl-generate-btn"
                onClick={handleGenerate}
                disabled={generating}
                id="btn-generate-cl"
              >
                {generating ? (
                  <><Loader2 size={18} className="spin" /> Generating…</>
                ) : !user ? (
                  <><Lock size={16} /> Sign In to Generate</>
                ) : !isPro ? (
                  <><Crown size={16} /> Upgrade to Generate</>
                ) : (
                  <><Sparkles size={18} /> Generate Cover Letter</>
                )}
              </button>
            </section>

            {/* ── RIGHT: Preview ── */}
            <section className="cl-preview-panel">
              {coverLetter ? (
                <>
                  <div className="cl-preview-toolbar">
                    <div className="cl-preview-toolbar-left">
                      <span className="cl-preview-label">Cover Letter Preview</span>
                      {aiEnhanced && (
                        <span className="cl-ai-badge"><Sparkles size={10} /> AI Enhanced</span>
                      )}
                    </div>
                    <div className="cl-preview-toolbar-right">
                      <button className="btn btn-secondary btn-sm" onClick={handleCopy} id="btn-cl-copy">
                        {copied ? <><CheckCircle size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleGenerate} id="btn-cl-regen">
                        <RefreshCw size={13} /> Regenerate
                      </button>
                      <button
                        className="btn btn-primary btn-sm cl-download-btn"
                        onClick={handleDownload}
                        disabled={downloading}
                        id="btn-cl-download"
                      >
                        {downloading
                          ? <><Loader2 size={13} className="spin" /> Saving…</>
                          : !isPro
                          ? <><Crown size={13} className="crown-gold" /> Download PDF</>
                          : <><Download size={13} /> Download PDF</>}
                      </button>
                    </div>
                  </div>

                  {/* The actual printable letter */}
                  <div className="cl-preview-doc" ref={previewRef} id="cl-preview-doc">
                    <div className="cl-letter-meta">
                      {jobInfo.company && <div className="cl-letter-to">{jobInfo.company}</div>}
                      {jobInfo.title   && <div className="cl-letter-role">{jobInfo.title}</div>}
                    </div>
                    <pre className="cl-letter-body">{coverLetter}</pre>
                  </div>
                </>
              ) : (
                <div className="cl-preview-empty">
                  <div className="cl-preview-empty-art">
                    <FileText size={52} />
                    <div className="cl-preview-empty-lines">
                      <div /><div /><div /><div /><div />
                    </div>
                  </div>
                  <h3>Your cover letter will appear here</h3>
                  <p>Fill in the job details and click <strong>Generate Cover Letter</strong></p>
                  {!isPro && (
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowPromo(true)}>
                      <Crown size={14} /> Unlock Pro to Generate
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <PromoModal
        isOpen={showPromo}
        onClose={() => setShowPromo(false)}
        onLoginRequired={() => { setShowPromo(false); setShowAuth(true); }}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────────
function ManualField({ label, value, onChange, placeholder, textarea }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {textarea ? (
        <textarea
          className="form-textarea"
          style={{ minHeight: 68 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="form-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
