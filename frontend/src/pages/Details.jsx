import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/layout/icons';
import TabOverview from '../components/details/TabOverview';
import PersonalTab from '../components/details/PersonalTab';
import EducationTab from '../components/details/EducationTab';
import SkillsTab from '../components/details/SkillsTab';
import ExperienceTab from '../components/details/ExperienceTab';
import ProjectsTab from '../components/details/ProjectsTab';
import ActivityTab from '../components/details/ActivityTab';
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
  const { user } = useAuth();

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
  };

  // Save
  const handleSave = () => {
    // TODO: persist to backend
    alert('Changes saved for ' + currentTab);
  };

  // Update helpers
  const updatePersonal = (field, value) => {
    setPersonal(prev => ({ ...prev, [field]: value }));
  };

  const updateEntry = (setter) => (id, field, value) => {
    setter(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateSkills = (field, value) => {
    setSkills(prev => ({ ...prev, [field]: value }));
  };

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
      default:
        return null;
    }
  };

  const isRepeatable = REPEATABLE_TABS.includes(currentTab);

  return (
    <div>
      {/* Header Row */}
      <div className="details-header-row">
        <button className="details-back-btn" onClick={() => navigate(-1)}>
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

      {/* Toolbar */}
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
