import { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Save, BarChart3, Compass, Crown, Layout } from 'lucide-react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import ActionButtons from '../components/ActionButtons';
import GradeResults from '../components/GradeResults';
import JobSuggestions from '../components/JobSuggestions';
import AuthModal from '../components/AuthModal';
import PromoModal from '../components/PromoModal';
import TemplateSelector from '../components/TemplateSelector';
import ExpiryWarningBanner from '../components/ExpiryWarningBanner';
import Modal from '../components/Modal';
import { parseResume, generateResume, gradeResume, suggestJobs } from '../api/resumeApi';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { saveResume, getResume } from '../firebase/resumeService';
import { incrementDownloadCount, trackTemplateUsage } from '../firebase/subscriptionService';
import useSecurityDeterrents from '../hooks/useSecurityDeterrents';
import '../App.css';

const INITIAL_RESUME = {
  personalInfo: { name: '', email: '', phone: '', linkedin: '', location: '' },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  template: 'default',
};

export default function BuilderPage() {
  const { user }      = useAuth();
  const { isPro, canDownload, downloadsLeft, downloadsLimit } = useSubscription();
  const { resumeId }  = useParams();
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  useSecurityDeterrents();

  const [resumeData,  setResumeData]  = useState(INITIAL_RESUME);
  const [currentId,   setCurrentId]   = useState(resumeId || null);
  const [gradeData,   setGradeData]   = useState(null);
  const [jobData,     setJobData]     = useState(null);
  const [isParsing,   setIsParsing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [showTmpl,    setShowTmpl]    = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'grade'|'jobs'|'auth'|'promo'
  const [loading, setLoading] = useState({ generate: false, grade: false, suggest: false });

  // Load existing resume when editing
  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      try {
        const data = await getResume(resumeId);
        if (data?.resumeData) {
          setResumeData(data.resumeData);
          setCurrentId(resumeId);
        } else {
          toast.error('Resume not found');
          navigate('/dashboard');
        }
      } catch {
        toast.error('Could not load resume');
      }
    })();
  }, [resumeId, navigate]);

  const hasContent =
    resumeData.personalInfo.name ||
    resumeData.experience.length > 0 ||
    resumeData.skills.length > 0;

  const update = useCallback((path, value) => {
    setResumeData(prev => {
      const keys = path.split('.');
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  // Template selection
  const handleSelectTemplate = useCallback((templateId) => {
    setResumeData(prev => ({ ...prev, template: templateId }));
    if (user && isPro) {
      trackTemplateUsage(user.uid, templateId).catch(() => {});
    }
    toast.success(`Template changed to ${templateId}`, { id: 'tmpl', duration: 1500 });
  }, [user, isPro]);

  // File upload → parse resume
  const handleFileUpload = useCallback(async (file) => {
    setIsParsing(true);
    toast.loading('Parsing your resume…', { id: 'parse' });
    try {
      const result = await parseResume(file);
      setResumeData(prev => ({ ...result, template: prev.template }));
      toast.success('Resume imported!', { id: 'parse' });
    } catch (err) {
      toast.error(err.message || 'Failed to parse resume', { id: 'parse' });
    } finally {
      setIsParsing(false);
    }
  }, []);

  // Save to Firestore
  const handleSave = useCallback(async () => {
    if (!user) { setActiveModal('auth'); return; }
    if (!hasContent) return toast.error('Add some content first');
    setIsSaving(true);
    toast.loading('Saving…', { id: 'save' });
    try {
      const id = await saveResume(user.uid, resumeData, resumeData.personalInfo.name, currentId);
      setCurrentId(id);
      if (!resumeId) navigate(`/builder/${id}`, { replace: true });
      toast.success('Resume saved!', { id: 'save' });
    } catch (err) {
      toast.error('Could not save resume', { id: 'save' });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [user, resumeData, currentId, resumeId, hasContent, navigate]);

  // AI: Generate / enhance
  const handleGenerate = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, generate: true }));
    toast.loading('Enhancing with AI…', { id: 'generate' });
    try {
      const result = await generateResume(resumeData);
      setResumeData(prev => ({ ...result, template: prev.template }));
      toast.success('Resume enhanced!', { id: 'generate' });
    } catch (err) {
      toast.error(err.message || 'Failed to generate resume', { id: 'generate' });
    } finally {
      setLoading(l => ({ ...l, generate: false }));
    }
  }, [resumeData, hasContent]);

  // AI: Grade
  const handleGrade = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, grade: true }));
    toast.loading('Grading your resume…', { id: 'grade' });
    try {
      const result = await gradeResume(resumeData);
      setGradeData(result);
      setActiveModal('grade');
      toast.success(`ATS Score: ${result.atsScore}/100`, { id: 'grade' });
    } catch (err) {
      toast.error(err.message || 'Failed to grade resume', { id: 'grade' });
    } finally {
      setLoading(l => ({ ...l, grade: false }));
    }
  }, [resumeData, hasContent]);

  // AI: Job suggestions
  const handleSuggestJobs = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, suggest: true }));
    toast.loading('Finding best-fit roles…', { id: 'suggest' });
    try {
      const result = await suggestJobs(resumeData);
      setJobData(result);
      setActiveModal('jobs');
      toast.success('Job matches found!', { id: 'suggest' });
    } catch (err) {
      toast.error(err.message || 'Failed to suggest jobs', { id: 'suggest' });
    } finally {
      setLoading(l => ({ ...l, suggest: false }));
    }
  }, [resumeData, hasContent]);

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    // 1. Auth gate
    if (!user) { setActiveModal('auth'); return; }
    // 2. Pro gate
    if (!isPro) { setActiveModal('promo'); return; }
    // 3. Download limit gate
    if (!canDownload) {
      toast.error(`Download limit reached (${downloadsLimit}/30 days). Your limit resets with the next period.`);
      return;
    }
    if (!hasContent) return toast.error('Add resume content before downloading');

    toast.loading('Generating PDF…', { id: 'pdf' });
    const el = document.getElementById('preview-page');
    if (!el) { toast.error('Preview not found', { id: 'pdf' }); return; }

    // Temporarily expand element for full capture (fix blank page issue)
    const prevMaxH    = el.style.maxHeight;
    const prevOverflow = el.style.overflowY;
    el.classList.add('print-mode');

    // Give browser a frame to reflow
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin:       [10, 10, 10, 10], // mm
        filename:     `${resumeData.personalInfo.name || 'resume'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();

      // Increment usage count
      await incrementDownloadCount(user.uid);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
      console.error('PDF error:', err);
    } finally {
      el.classList.remove('print-mode');
      el.style.maxHeight = prevMaxH;
      el.style.overflowY = prevOverflow;
    }
  }, [user, isPro, canDownload, hasContent, resumeData.personalInfo.name, downloadsLimit]);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#12122a', color: '#f0f0fa', border: '1px solid rgba(168,85,247,0.22)', borderRadius: '12px', fontSize: '0.875rem', fontFamily: 'var(--font-family)', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' },
      }} />

      <Header onUpgradeClick={() => setActiveModal('promo')} />

      <main className="app-main">
        {/* Left sidebar */}
        <aside className="app-sidebar">
          <FileUpload
            onFileParsed={handleFileUpload}
            isLoading={isParsing}
            autoOpen={searchParams.get('upload') === '1'}
          />

          {/* Template Selector (shown when toggled) */}
          <div className="builder-tmpl-toggle">
            <button
              className={`btn btn-secondary btn-sm ${showTmpl ? 'btn-active' : ''}`}
              onClick={() => setShowTmpl(v => !v)}
              id="btn-toggle-templates"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Layout size={14} />
              {showTmpl ? 'Hide Templates' : 'Choose Template'}
              {!isPro && <Crown size={12} style={{ color: '#fbbf24', marginLeft: 4 }} />}
            </button>
          </div>

          {showTmpl && (
            <TemplateSelector
              currentTemplate={resumeData.template || 'default'}
              onSelect={handleSelectTemplate}
              onUpgradeClick={() => setActiveModal('promo')}
            />
          )}

          <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />

          {user && (
            <button
              className="btn btn-secondary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSave}
              disabled={isSaving || !hasContent}
              id="btn-save"
            >
              <Save size={16} />
              {isSaving ? 'Saving…' : currentId ? 'Save Changes' : 'Save Resume'}
            </button>
          )}

          <ActionButtons
            onGenerate={handleGenerate}
            onGrade={handleGrade}
            onSuggestJobs={handleSuggestJobs}
            onDownload={handleDownload}
            loading={loading}
            hasPreview={!!hasContent}
            isPro={isPro}
            downloadsLeft={downloadsLeft}
            downloadsLimit={downloadsLimit}
          />
        </aside>

        {/* Preview */}
        <section className="app-content">
          <ExpiryWarningBanner onUpgradeClick={() => setActiveModal('promo')} />
          <ResumePreview resumeData={resumeData} />
        </section>
      </main>

      {/* Modals */}
      <Modal isOpen={activeModal === 'grade'} onClose={closeModal} title="ATS Resume Grade" icon={BarChart3}>
        <GradeResults gradeData={gradeData} />
      </Modal>

      <Modal isOpen={activeModal === 'jobs'} onClose={closeModal} title="Job Match Analysis" icon={Compass}>
        <JobSuggestions jobData={jobData} />
      </Modal>

      <AuthModal isOpen={activeModal === 'auth'} onClose={closeModal} />

      <PromoModal
        isOpen={activeModal === 'promo'}
        onClose={closeModal}
        onLoginRequired={() => setActiveModal('auth')}
      />
    </div>
  );
}
