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

// All possible content sections (order matters)
const ALL_SECTIONS = [
  'Personal',
  'Education',
  'Skills',
  'Professional Experience',
  'Projects',
  'Extra Curricular Activity',
];

const REPEATABLE_SECTIONS = ['Education', 'Professional Experience', 'Projects', 'Extra Curricular Activity'];

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
  const [saving, setSaving] = useState(false);

  // Resume title + rename
  const [resumeTitle, setResumeTitle] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Active sections — which sections the user has enabled
  const [activeSections, setActiveSections] = useState([...ALL_SECTIONS]);

  const [currentTab, setCurrentTab] = useState('Tab Overview');
  const [selections, setSelections] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Compute visible tabs dynamically
  const hasPersonal = activeSections.includes('Personal');
  const visibleTabs = [
    'Tab Overview',
    ...activeSections,
    ...(hasPersonal ? ['Create Resume'] : []),
  ];

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

        // Set title
        setResumeTitle(info.title || '');

        // Populate personal info
        if (info.personalInfo) {
          const p = info.personalInfo;
          setPersonal({
            firstName: p.fullName?.split(' ')[0] || '',
            lastName: p.fullName?.split(' ').slice(1).join(' ') || '',
            email: p.email || user?.email || '',
            phone: p.phone || '',
            location: p.location || '',
            github: (p.links || []).find(l => l.includes?.('github'))?.replace(/^https?:\/\//, '') || '',
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

  // Tab navigation — uses visibleTabs
  const currentTabIndex = visibleTabs.indexOf(currentTab);

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(visibleTabs[currentTabIndex - 1]);
      setSelections({});
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < visibleTabs.length - 1) {
      setCurrentTab(visibleTabs[currentTabIndex + 1]);
      setSelections({});
    }
  };

  // If current tab was removed, go back to Tab Overview
  useEffect(() => {
    if (!visibleTabs.includes(currentTab)) {
      setCurrentTab('Tab Overview');
    }
  }, [activeSections]);

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
        return activeSections.map(t => ({ id: t }));
      case 'Education': return educationEntries;
      case 'Professional Experience': return experienceEntries;
      case 'Projects': return projectEntries;
      case 'Extra Curricular Activity': return activityEntries;
      default: return [];
    }
  };

  // Sections that have been removed and can be re-added
  const removedSections = ALL_SECTIONS.filter(s => !activeSections.includes(s));

  // --- Add logic ---
  const handleAdd = (tab) => {
    if (currentTab === 'Tab Overview') {
      // Re-add a removed section
      if (!activeSections.includes(tab)) {
        // Insert in original order
        const newActive = ALL_SECTIONS.filter(s => activeSections.includes(s) || s === tab);
        setActiveSections(newActive);
      }
    } else {
      // Add an entry within the current (or selected) tab
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
    }
    setShowAddModal(false);
  };

  // --- Remove logic ---
  const handleRemove = () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    if (currentTab === 'Tab Overview') {
      // Remove selected sections — but Personal is required minimum
      const toRemove = ids.filter(id => id !== 'Personal');
      setActiveSections(prev => prev.filter(s => !toRemove.includes(s)));
      setSelections(prev => ({ ...prev, 'Tab Overview': [] }));
    } else {
      // Remove selected entries within the tab
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
    }
    setShowDeleteModal(false);
    markDetailsUpdated();
  };

  // --- Build templateInfo for save ---
  const buildTemplateInfo = () => {
    const info = {
      title: resumeTitle,
    };

    if (activeSections.includes('Personal')) {
      info.personalInfo = {
        fullName: `${personal.firstName} ${personal.lastName}`.trim(),
        email: personal.email,
        phone: personal.phone,
        location: personal.location,
        links: personal.github ? [`https://${personal.github.replace(/^https?:\/\//, '')}`] : [],
      };
    }

    if (activeSections.includes('Education')) {
      info.education = educationEntries.map(e => ({
        degree: e.degree,
        fieldOfStudy: e.program,
        institution: e.location,
        gpa: e.cgpa,
        startDate: e.startDate,
        endDate: e.endDate,
      }));
    }

    if (activeSections.includes('Skills')) {
      info.skills = [
        { category: 'Languages', skills: skills.languages.split(',').map(s => s.trim()).filter(Boolean) },
        { category: 'Technologies', skills: skills.technologies.split(',').map(s => s.trim()).filter(Boolean) },
        { category: 'Databases', skills: skills.databases.split(',').map(s => s.trim()).filter(Boolean) },
        { category: 'Tools', skills: skills.tools.split(',').map(s => s.trim()).filter(Boolean) },
      ].filter(s => s.skills.length > 0);
    }

    if (activeSections.includes('Professional Experience')) {
      info.experience = experienceEntries.map(e => ({
        company: e.company,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        title: e.role,
        description: e.description,
      }));
    }

    if (activeSections.includes('Projects')) {
      info.projects = projectEntries.map(p => ({
        name: p.name,
        location: p.location,
        startDate: p.startDate,
        endDate: p.endDate,
        role: p.role,
        description: p.description,
        url: p.githubUrl,
      }));
    }

    if (activeSections.includes('Extra Curricular Activity')) {
      info.certifications = activityEntries.map(a => ({
        name: a.name,
        issuer: a.location,
        date: a.startDate,
      }));
    }

    return info;
  };

  // --- Save ---
  const handleSave = async () => {
    if (!resumeId) {
      alert('No resume ID — create a resume from a template first.');
      return;
    }

    setSaving(true);
    try {
      // Fetch existing to preserve fields we don't manage
      const existing = await resumeService.getDetails(resumeId);
      const fullTemplateInfo = {
        ...existing.templateInfo,
        ...buildTemplateInfo(),
        updatedAt: undefined, // let backend set this
      };
      await resumeService.updateDetails(resumeId, fullTemplateInfo);
      markDetailsUpdated();
    } catch (err) {
      alert(err || 'Failed to save changes');
    } finally {
      setSaving(false);
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

  // --- Rename ---
  const openRenameModal = () => {
    setRenameValue(resumeTitle);
    setShowRenameModal(true);
  };

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    const newTitle = renameValue.trim();
    setResumeTitle(newTitle);
    setShowRenameModal(false);

    // Persist if we have a resumeId
    if (resumeId) {
      setRenaming(true);
      try {
        const existing = await resumeService.getDetails(resumeId);
        const fullTemplateInfo = { ...existing.templateInfo, title: newTitle };
        await resumeService.updateDetails(resumeId, fullTemplateInfo);
      } catch {
        // Title updated locally even if backend fails
      } finally {
        setRenaming(false);
      }
    }
  };

  // --- Create Resume handlers ---

  const handleCreateResume = async () => {
    if (!resumeId) {
      setGenerationError('No resume ID — create a resume from a template first.');
      return;
    }

    if (!hasPersonal) {
      setGenerationError('Personal section is required to generate a resume.');
      return;
    }

    try {
      setIsGeneratingResume(true);
      setGenerationError('');

      // Save first before generating
      const existing = await resumeService.getDetails(resumeId);
      const fullTemplateInfo = { ...existing.templateInfo, ...buildTemplateInfo() };
      await resumeService.updateDetails(resumeId, fullTemplateInfo);

      await resumeService.generatePdf(resumeId);

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
            tabs={activeSections}
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

  const isTabOverview = currentTab === 'Tab Overview';
  const isCreateResumeTab = currentTab === 'Create Resume';
  const isContentTab = !isTabOverview && !isCreateResumeTab;
  const isRepeatableTab = REPEATABLE_SECTIONS.includes(currentTab);

  // Determine what Add modal should show
  const getAddModalTabs = () => {
    if (isTabOverview) {
      // Show removed sections that can be re-added
      return removedSections;
    }
    // On a content tab, show repeatable sections for adding entries
    return isRepeatableTab ? [currentTab] : REPEATABLE_SECTIONS;
  };

  const getAddModalDefault = () => {
    if (isTabOverview) return removedSections[0] || '';
    return isRepeatableTab ? currentTab : REPEATABLE_SECTIONS[0];
  };

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
      {/* Resume Title */}
      {resumeTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{resumeTitle}</h2>
          <button
            className="details-action-link"
            onClick={openRenameModal}
            style={{ fontSize: '0.85rem' }}
          >
            Rename
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="details-header-row">
        <button className="details-back-btn" onClick={() => handleNavigateAway('/resumes')}>
          <ChevronLeftIcon /> Back
        </button>

        <div className="details-header-center">
          <label>Current Tab</label>
          <select
            className="details-tab-select"
            value={currentTab}
            onChange={(e) => { setCurrentTab(e.target.value); setSelections({}); }}
          >
            {visibleTabs.map(tab => (
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
              disabled={currentTabIndex >= visibleTabs.length - 1}
              aria-label="Next tab"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="details-toolbar">
          <div className="details-toolbar-left">
            {/* Select All — only on Tab Overview */}
            {isTabOverview && (
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
            )}

            <button
              className="toolbar-action"
              onClick={() => {
                const tabs = getAddModalTabs();
                if (tabs.length > 0) {
                  setShowAddModal(true);
                }
              }}
              disabled={isTabOverview ? removedSections.length === 0 : false}
            >
              <span>+</span> Add
            </button>

            <button
              className="toolbar-action delete-action"
              onClick={() => getSelectedIds().length > 0 && setShowDeleteModal(true)}
              disabled={getSelectedIds().length === 0}
            >
              <TrashIcon /> Remove
            </button>

            <button
              className="toolbar-action save-action"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
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
              disabled={currentTabIndex >= visibleTabs.length - 1}
              aria-label="Next tab"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTab()}

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          tabs={getAddModalTabs()}
          defaultTab={getAddModalDefault()}
          onAdd={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Remove Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleRemove}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Rename Resume</div>
            <div className="modal-body">
              <label htmlFor="rename-input" style={{ display: 'block', marginBottom: 8 }}>
                New name
              </label>
              <input
                id="rename-input"
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
                autoFocus
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn-cancel"
                onClick={() => setShowRenameModal(false)}
                disabled={renaming}
              >
                Cancel
              </button>
              <button
                className="modal-btn-confirm"
                onClick={handleRename}
                disabled={!renameValue.trim() || renaming}
              >
                {renaming ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
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
