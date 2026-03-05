import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resumeService from '../services/resumeService';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import TabOverview from '../components/details/TabOverview';
import PersonalTab from '../components/details/PersonalTab';
import EducationTab from '../components/details/EducationTab';
import SkillsTab from '../components/details/SkillsTab';
import ExperienceTab from '../components/details/ExperienceTab';
import ProjectsTab from '../components/details/ProjectsTab';
import ActivityTab from '../components/details/ActivityTab';
import CreateResumeTab from '../components/details/CreateResumeTab';
import AddModal from '../components/details/AddModal';
import DeleteModal from '../components/details/DeleteModal';
import '../styles/details.css';

const TAB_ORDER = [
  'Tab Overview',
  'Personal',
  'Education',
  'Skills',
  'Professional Experience',
  'Projects',
  'Extra Curricular Activity',
  'Create Resume',
];

const REPEATABLE_TABS = ['Education', 'Professional Experience', 'Projects', 'Extra Curricular Activity'];

let nextId = 100;
const genId = () => String(nextId++);

const createEntry = (tab) => {
  const id = genId();
  switch (tab) {
    case 'Education':
      return { id, degree: '', program: '', location: '', cgpa: '', startDate: '', endDate: '' };
    case 'Professional Experience':
      return { id, company: '', location: '', startDate: '', endDate: '', role: '', description: '' };
    case 'Projects':
      return { id, name: '', location: '', startDate: '', endDate: '', role: '', description: '', githubUrl: '' };
    case 'Extra Curricular Activity':
      return { id, name: '', location: '', startDate: '', endDate: '', role: '', description: '' };
    default:
      return { id };
  }
};

const Details = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const { user } = useAuth();
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [currentTab, setCurrentTab] = useState('Tab Overview');
  const [selections, setSelections] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [personal, setPersonal] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    location: '',
    github: '',
  });

  const [educationEntries, setEducationEntries] = useState([
    createEntry('Education'),
  ]);

  const [skills, setSkills] = useState({
    languages: '',
    technologies: '',
    databases: '',
    tools: '',
  });

  const [experienceEntries, setExperienceEntries] = useState([
    createEntry('Professional Experience'),
  ]);

  const [projectEntries, setProjectEntries] = useState([
    createEntry('Projects'),
  ]);

  const [activityEntries, setActivityEntries] = useState([
    createEntry('Extra Curricular Activity'),
  ]);

  // Create Resume state
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [resumeDownloaded, setResumeDownloaded] = useState(false);
  const [resumeLastGeneratedAt, setResumeLastGeneratedAt] = useState(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [detailsLastUpdatedAt, setDetailsLastUpdatedAt] = useState(null);

  // Navigation guard
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Stale detection
  const isResumeStale = resumeGenerated &&
    detailsLastUpdatedAt != null &&
    resumeLastGeneratedAt != null &&
    detailsLastUpdatedAt > resumeLastGeneratedAt;

  // Load existing resume details when resumeId is present
  useEffect(() => {
    if (!resumeId) return;

    const loadResumeDetails = async () => {
      setLoadingResume(true);
      setLoadError('');
      try {
        const data = await resumeService.getDetails(resumeId);
        const info = data.templateInfo || {};

        // Populate personal info
        if (info.personalInfo) {
          const p = info.personalInfo;
          setPersonal({
            firstName: p.fullName?.split(' ')[0] || '',
            lastName: p.fullName?.split(' ').slice(1).join(' ') || '',
            email: p.email || user?.email || '',
            phone: p.phone || '',
            location: p.location || '',
            github: (p.links || []).find(l => l.includes('github'))?.replace(/^https?:\/\//, '') || '',
          });
        }

        // Populate education
        if (info.education?.length > 0) {
          setEducationEntries(info.education.map((e, i) => ({
            id: e._id || String(100 + i),
            degree: e.degree || '',
            program: e.fieldOfStudy || e.program || '',
            location: e.institution || e.location || '',
            cgpa: e.gpa || e.cgpa || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
          })));
        }

        // Populate skills
        if (info.skills?.length > 0) {
          const skillMap = { languages: '', technologies: '', databases: '', tools: '' };
          info.skills.forEach(s => {
            const cat = s.category?.toLowerCase() || '';
            if (cat.includes('language')) skillMap.languages = s.skills?.join(', ') || s.name || '';
            else if (cat.includes('tech') || cat.includes('framework')) skillMap.technologies = s.skills?.join(', ') || s.name || '';
            else if (cat.includes('database')) skillMap.databases = s.skills?.join(', ') || s.name || '';
            else if (cat.includes('tool')) skillMap.tools = s.skills?.join(', ') || s.name || '';
            else if (!skillMap.technologies) skillMap.technologies = s.skills?.join(', ') || s.name || '';
          });
          setSkills(skillMap);
        }

        // Populate experience
        if (info.experience?.length > 0) {
          setExperienceEntries(info.experience.map((e, i) => ({
            id: e._id || String(200 + i),
            company: e.company || '',
            location: e.location || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            role: e.title || e.role || '',
            description: e.description || (e.highlights || []).join('\n') || '',
          })));
        }

        // Populate projects
        if (info.projects?.length > 0) {
          setProjectEntries(info.projects.map((p, i) => ({
            id: p._id || String(300 + i),
            name: p.name || p.title || '',
            location: p.location || '',
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            role: p.role || '',
            description: p.description || (p.highlights || []).join('\n') || '',
            githubUrl: p.url || p.githubUrl || '',
          })));
        }

        // Populate certifications as activities if present
        if (info.certifications?.length > 0) {
          setActivityEntries(info.certifications.map((c, i) => ({
            id: c._id || String(400 + i),
            name: c.name || '',
            location: c.issuer || '',
            startDate: c.date || '',
            endDate: '',
            role: '',
            description: '',
          })));
        }
      } catch (err) {
        setLoadError(err || 'Failed to load resume details');
      } finally {
        setLoadingResume(false);
      }
    };

    loadResumeDetails();
  }, [resumeId]);

  // Track detail changes for stale detection
  const markDetailsUpdated = useCallback(() => {
    setDetailsLastUpdatedAt(Date.now());
  }, []);

  // Tab navigation
  const currentTabIndex = TAB_ORDER.indexOf(currentTab);

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(TAB_ORDER[currentTabIndex - 1]);
      setSelections({});
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < TAB_ORDER.length - 1) {
      setCurrentTab(TAB_ORDER[currentTabIndex + 1]);
      setSelections({});
    }
  };

  // Selection helpers
  const getSelectedIds = () => selections[currentTab] || [];

  const toggleSelection = useCallback((tab, id) => {
    setSelections(prev => {
      const current = prev[tab] || [];
      const next = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      return { ...prev, [tab]: next };
    });
  }, []);

  const selectAll = () => {
    const entries = getEntriesForTab(currentTab);
    const allIds = entries.map(e => e.id);
    const currentSel = getSelectedIds();
    const allSelected = allIds.length > 0 && allIds.every(id => currentSel.includes(id));
    setSelections(prev => ({
      ...prev,
      [currentTab]: allSelected ? [] : allIds,
    }));
  };

  const getEntriesForTab = (tab) => {
    switch (tab) {
      case 'Tab Overview':
        return TAB_ORDER.slice(1).map(t => ({ id: t }));
      case 'Education': return educationEntries;
      case 'Professional Experience': return experienceEntries;
      case 'Projects': return projectEntries;
      case 'Extra Curricular Activity': return activityEntries;
      default: return [];
    }
  };

  // Add entry
  const handleAdd = (tab) => {
    const entry = createEntry(tab);
    switch (tab) {
      case 'Education':
        setEducationEntries(prev => [...prev, entry]);
        break;
      case 'Professional Experience':
        setExperienceEntries(prev => [...prev, entry]);
        break;
      case 'Projects':
        setProjectEntries(prev => [...prev, entry]);
        break;
      case 'Extra Curricular Activity':
        setActivityEntries(prev => [...prev, entry]);
        break;
      default:
        break;
    }
    setShowAddModal(false);
  };

  // Delete selected
  const handleDelete = () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    const filterOut = (entries) => entries.filter(e => !ids.includes(e.id));
    switch (currentTab) {
      case 'Education':
        setEducationEntries(filterOut);
        break;
      case 'Professional Experience':
        setExperienceEntries(filterOut);
        break;
      case 'Projects':
        setProjectEntries(filterOut);
        break;
      case 'Extra Curricular Activity':
        setActivityEntries(filterOut);
        break;
      default:
        break;
    }
    setSelections(prev => ({ ...prev, [currentTab]: [] }));
    setShowDeleteModal(false);
    markDetailsUpdated();
  };

  // Save
  const handleSave = async () => {
    if (!resumeId) {
      markDetailsUpdated();
      alert('No resume ID — save from a created resume.');
      return;
    }

    try {
      const templateInfo = {
        personalInfo: {
          fullName: `${personal.firstName} ${personal.lastName}`.trim(),
          email: personal.email,
          phone: personal.phone,
          location: personal.location,
          links: personal.github ? [`https://${personal.github.replace(/^https?:\/\//, '')}`] : [],
        },
        education: educationEntries.map(e => ({
          degree: e.degree,
          fieldOfStudy: e.program,
          institution: e.location,
          gpa: e.cgpa,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
        skills: [
          { category: 'Languages', skills: skills.languages.split(',').map(s => s.trim()).filter(Boolean) },
          { category: 'Technologies', skills: skills.technologies.split(',').map(s => s.trim()).filter(Boolean) },
          { category: 'Databases', skills: skills.databases.split(',').map(s => s.trim()).filter(Boolean) },
          { category: 'Tools', skills: skills.tools.split(',').map(s => s.trim()).filter(Boolean) },
        ].filter(s => s.skills.length > 0),
        experience: experienceEntries.map(e => ({
          company: e.company,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          title: e.role,
          description: e.description,
        })),
        projects: projectEntries.map(p => ({
          name: p.name,
          location: p.location,
          startDate: p.startDate,
          endDate: p.endDate,
          role: p.role,
          description: p.description,
          url: p.githubUrl,
        })),
        certifications: activityEntries.map(a => ({
          name: a.name,
          issuer: a.location,
          date: a.startDate,
        })),
      };

      await resumeService.updateDetails(resumeId, templateInfo);
      markDetailsUpdated();
    } catch (err) {
      alert(err || 'Failed to save changes');
    }
  };

  // Update helpers (with stale tracking)
  const updatePersonal = (field, value) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
    markDetailsUpdated();
  };

  const updateEntry = (setter) => (id, field, value) => {
    setter(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    markDetailsUpdated();
  };

  const updateSkills = (field, value) => {
    setSkills(prev => ({ ...prev, [field]: value }));
    markDetailsUpdated();
  };

  // --- Create Resume handlers ---

  const hasRequiredData = () => {
    const hasPersonal = personal.firstName.trim() || personal.lastName.trim();
    const hasContent =
      educationEntries.some(e => e.degree || e.program) ||
      experienceEntries.some(e => e.company || e.role) ||
      projectEntries.some(e => e.name) ||
      activityEntries.some(e => e.name) ||
      skills.languages || skills.technologies;
    return hasPersonal && hasContent;
  };

  const handleCreateResume = async () => {
    if (!resumeId) {
      setGenerationError('No resume ID — create a resume from a template first.');
      return;
    }

    if (!hasRequiredData()) {
      setGenerationError('Complete required sections first (Personal + at least one content section).');
      return;
    }

    try {
      setIsGeneratingResume(true);
      setGenerationError('');

      const data = await resumeService.generatePdf(resumeId);

      // Try to load the PDF for preview
      let previewUrl = null;
      try {
        const pdfBlob = await resumeService.downloadPdf(resumeId);
        previewUrl = URL.createObjectURL(pdfBlob);
      } catch {
        // Preview may not be available immediately
      }

      setResumePreviewUrl(previewUrl);
      setResumeGenerated(true);
      setResumeDownloaded(false);
      setResumeLastGeneratedAt(Date.now());
    } catch (err) {
      setGenerationError(err || 'Could not generate resume. Try again.');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!resumeGenerated || !resumeId) return;

    try {
      const pdfBlob = await resumeService.downloadPdf(resumeId);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${personal.firstName || 'resume'}_${personal.lastName || ''}.pdf`.trim();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setResumeDownloaded(true);
    } catch (err) {
      alert(err || 'Failed to download resume.');
    }
  };

  // --- Navigation guard ---

  const handleNavigateAway = useCallback((path) => {
    if (resumeGenerated && !resumeDownloaded) {
      setPendingNavigation(path);
      setShowLeaveModal(true);
    } else {
      navigate(path);
    }
  }, [resumeGenerated, resumeDownloaded, navigate]);

  useEffect(() => {
    if (!resumeGenerated || resumeDownloaded) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [resumeGenerated, resumeDownloaded]);

  // Render active tab content
  const renderTab = () => {
    switch (currentTab) {
      case 'Tab Overview':
        return (
          <TabOverview
            tabs={TAB_ORDER.slice(1)}
            selections={selections['Tab Overview'] || []}
            onToggle={(tab) => toggleSelection('Tab Overview', tab)}
            onSelectTab={setCurrentTab}
          />
        );
      case 'Personal':
        return (
          <PersonalTab
            data={personal}
            onChange={updatePersonal}
          />
        );
      case 'Education':
        return (
          <EducationTab
            entries={educationEntries}
            selections={getSelectedIds()}
            onToggle={(id) => toggleSelection('Education', id)}
            onChange={updateEntry(setEducationEntries)}
          />
        );
      case 'Skills':
        return (
          <SkillsTab
            data={skills}
            onChange={updateSkills}
          />
        );
      case 'Professional Experience':
        return (
          <ExperienceTab
            entries={experienceEntries}
            selections={getSelectedIds()}
            onToggle={(id) => toggleSelection('Professional Experience', id)}
            onChange={updateEntry(setExperienceEntries)}
          />
        );
      case 'Projects':
        return (
          <ProjectsTab
            entries={projectEntries}
            selections={getSelectedIds()}
            onToggle={(id) => toggleSelection('Projects', id)}
            onChange={updateEntry(setProjectEntries)}
            githubUrl={personal.github}
          />
        );
      case 'Extra Curricular Activity':
        return (
          <ActivityTab
            entries={activityEntries}
            selections={getSelectedIds()}
            onToggle={(id) => toggleSelection('Extra Curricular Activity', id)}
            onChange={updateEntry(setActivityEntries)}
          />
        );
      case 'Create Resume':
        return (
          <CreateResumeTab
            resumePreviewUrl={resumePreviewUrl}
            resumeGenerated={resumeGenerated}
            resumeDownloaded={resumeDownloaded}
            isGenerating={isGeneratingResume}
            generationError={generationError}
            isStale={isResumeStale}
            onCreateResume={handleCreateResume}
            onDownload={handleDownloadResume}
          />
        );
      default:
        return null;
    }
  };

  const isRepeatable = REPEATABLE_TABS.includes(currentTab);
  const isCreateResumeTab = currentTab === 'Create Resume';

  if (loadingResume) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="resumes-spinner" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        {loadError}
      </div>
    );
  }

  return (
    <div>
      {/* Header Row */}
      <div className="details-header-row">
        <button className="details-back-btn" onClick={() => handleNavigateAway('/dashboard')}>
          <ChevronLeftIcon /> Back
        </button>

        <div className="details-header-center">
          <label>Current Tab</label>
          <select
            className="details-tab-select"
            value={currentTab}
            onChange={(e) => { setCurrentTab(e.target.value); setSelections({}); }}
          >
            {TAB_ORDER.map(tab => (
              <option key={tab} value={tab}>{tab}</option>
            ))}
          </select>
        </div>

        <div className="details-header-right">
          <button className="details-action-link" onClick={() => {}}>Apply</button>
          <button className="details-action-link" onClick={() => {}}>Reset</button>
        </div>
      </div>

      {/* Toolbar — changes based on tab */}
      {isCreateResumeTab ? (
        <div className="details-toolbar">
          <div className="details-toolbar-left">
            <button
              className="toolbar-action save-action"
              onClick={handleCreateResume}
              disabled={isGeneratingResume}
            >
              {isGeneratingResume
                ? 'Generating...'
                : (resumeGenerated && isResumeStale)
                  ? 'Regenerate Resume'
                  : 'Create Resume'}
            </button>

            <button
              className="toolbar-action"
              onClick={handleDownloadResume}
              disabled={!resumeGenerated || isResumeStale}
            >
              Download
            </button>
          </div>

          <div className="details-toolbar-right">
            <button
              className="toolbar-nav-btn"
              onClick={goToPrevTab}
              disabled={currentTabIndex <= 0}
              aria-label="Previous tab"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="toolbar-nav-btn"
              onClick={goToNextTab}
              disabled={currentTabIndex >= TAB_ORDER.length - 1}
              aria-label="Next tab"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="details-toolbar">
          <div className="details-toolbar-left">
            <label className="toolbar-select-all">
              <input
                type="checkbox"
                checked={(() => {
                  const entries = getEntriesForTab(currentTab);
                  const sel = getSelectedIds();
                  return entries.length > 0 && entries.every(e => sel.includes(e.id));
                })()}
                onChange={selectAll}
              />
              Select All
            </label>

            <button className="toolbar-action" onClick={() => setShowAddModal(true)}>
              <span>+</span> Add
            </button>

            <button
              className="toolbar-action delete-action"
              onClick={() => getSelectedIds().length > 0 && setShowDeleteModal(true)}
            >
              <TrashIcon /> Delete
            </button>

            <button className="toolbar-action save-action" onClick={handleSave}>
              Save
            </button>
          </div>

          <div className="details-toolbar-right">
            <button
              className="toolbar-nav-btn"
              onClick={goToPrevTab}
              disabled={currentTabIndex <= 0}
              aria-label="Previous tab"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className="toolbar-nav-btn"
              onClick={goToNextTab}
              disabled={currentTabIndex >= TAB_ORDER.length - 1}
              aria-label="Next tab"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTab()}

      {/* Modals */}
      {showAddModal && (
        <AddModal
          tabs={isRepeatable ? [currentTab] : REPEATABLE_TABS}
          defaultTab={isRepeatable ? currentTab : REPEATABLE_TABS[0]}
          onAdd={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Leave-without-download modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Download Resume?</div>
            <div className="modal-body">
              <p>Do you want to download your resume before leaving?</p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn-cancel"
                onClick={() => {
                  setShowLeaveModal(false);
                  if (pendingNavigation) navigate(pendingNavigation);
                }}
              >
                Leave
              </button>
              <button
                className="modal-btn-confirm"
                onClick={() => {
                  handleDownloadResume();
                  setShowLeaveModal(false);
                  if (pendingNavigation) navigate(pendingNavigation);
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default Details;
