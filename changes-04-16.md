Current state: ProjectsTab.jsx has a "Generate with ERA" button and an auto-import stub (handleImport at
   line ~8) that creates fake projects. No GitHub service file exists.

  Proposed work:
  - Create a githubService.js with calls to all three endpoints.
  - In ProjectsTab.jsx, replace the mock handleImport() with a real flow:
    a. Prompt the student for their GitHub username (or pull it from personalInfo.github if already
  saved).
    b. Call POST /api/github/preview and display a selectable list of public repositories (name,
  description, language, stars).
    c. Let the student check/uncheck repos, then call POST /api/github/resume/:id/import with the selected
   projects.
    d. On each imported project card, show a "Remove" action that calls the DELETE endpoint.
  - This replaces the current mock data path and gives students real project import from GitHub.

  ---
  2. Hunter / Job-Matching — Wire Up Real Backend

  Backend endpoints available:
  - POST /api/hunter/companies/dynamic — fetch companies by location, type, keywords
  - POST /api/hunter/jobs — fetch job descriptions by company, location, keywords
  - POST /api/hunter/analyze — compare resume to job description, returns ATS score + AI feedback
  - POST /api/resumes/:id/ai-feedback/accept-all — accept AI-generated suggestions and optionally
  regenerate

  Current state: Hunter.jsx uses MOCK_RESUMES, MOCK_COMPANIES, MOCK_JOBS, and generateMockAnalysis(). The
  hunterService.js endpoints don't match the real backend (uses GET instead of POST, wrong paths).

  Proposed work:
  - Fix hunterService.js to match the actual backend:
    - POST /api/hunter/companies/dynamic with { location, companyType, keywords } body
    - POST /api/hunter/jobs with { company, location, keywords } body
    - POST /api/hunter/analyze with { resumeId, jobs: [...] } body (not companyId/jobId)
    - Add POST /api/resumes/:id/ai-feedback/accept-all for accepting AI suggestions
  - Redesign the Hunter page flow:
    a. Step 1 — Search: Student enters location, company type, and keywords. Frontend calls
  /companies/dynamic and displays matching companies.
    b. Step 2 — Jobs: Student selects a company. Frontend calls /jobs and lists job descriptions.
    c. Step 3 — Analyze: Student picks a resume and one or more jobs. Frontend calls /analyze and displays
   the ATS score, match score, and AI-generated feedback (with fieldPath, originalValue, suggestedValue,
  note).
    d. Step 4 — Accept Feedback: Student reviews suggestions, accepts/rejects individually, then calls
  /ai-feedback/accept-all with the accepted comments and autoRegenerate: true to regenerate the resume.
  - Remove all mock data constants and the generateMockAnalysis() function.

  ---
  3. Report / Resume Analysis — Wire Up Real Backend

  Backend endpoints available:
  - POST /api/report/analyze-resume with { resumeId } — returns overallScore, 17 criteria scores, and
  aiSuggestions
  - POST /api/report/accept-feedback with { resumeId, comments, autoRegenerate } — applies suggestions

  Current state: Report.jsx uses MOCK_RESUMES and generateMockReport(). No service file exists for report
  endpoints.

  Proposed work:
  - Create a reportService.js with:
    - analyzeResume(resumeId) → POST /api/report/analyze-resume
    - acceptFeedback(resumeId, comments, autoRegenerate) → POST /api/report/accept-feedback
  - Redesign Report.jsx:
    a. Replace the resume dropdown mock with a real call to resumeService.getMyResumes().
    b. On "Generate Report", call analyzeResume(resumeId) and display the real response.
    c. Show the overallScore prominently, then list all 17 criteria with individual scores, feedback text,
   and visual score bars.
    d. Display aiSuggestions as actionable cards (original vs. suggested value, with accept/reject
  toggles).
    e. On "Update Resume", call acceptFeedback() with accepted suggestions and autoRegenerate: true.
    f. On "Download", call resumeService.getPdf(resumeId) to download the regenerated PDF.
  - Remove all mock data.

  ---
  4. ERA (Experience/Resume Augmentation) — Wire Up "Generate with ERA" Buttons

  Backend endpoint available:
  - POST /api/era/generate with { type, brief, context, points } — returns enhanced descriptions

  Current state: Three "Generate with ERA" buttons exist in the UI but are non-functional (onClick={()
  {}}):
  - ExperienceTab.jsx line ~67
  - ProjectsTab.jsx line ~120
  - ActivityTab.jsx line ~67

  Proposed work:
  - Create an eraService.js with generate(type, brief, context, points).
  - For each tab, implement the click handler:
    a. Gather the current entry's brief description and bullet points from the form state.
    b. Set type to "job" for Experience, "project" for Projects, "activity" for Activities.
    c. Set context from the entry's title/role (e.g., "Software engineer at Amazon").
    d. Call the ERA endpoint and display the enhanced description in a preview modal.
    e. Let the student accept (replaces current text) or dismiss.
  - Add loading states on the buttons during the API call.

  ---
  5. Resume Generation with enhanceProjects Flag

  Backend capability: POST /api/resumes/:id/generate accepts { enhanceProjects: true } to match resume
  formatting with the selected template.

  Current state: resumeService.generatePdf() sends an empty POST body — no parameters.

  Proposed work:
  - Add a toggle/checkbox in the CreateResumeTab.jsx labeled "Enhance projects to match template format"
  (or similar).
  - Pass { enhanceProjects: true/false } in the body of the generate call.
  - This gives students control over whether AI reformats their project descriptions during PDF
  generation.

  ---
  Part 2 — Existing Features That Can Be Improved

  6. Hunter Page — Endpoint Alignment & UX

  Issue: hunterService.js defines GET endpoints that don't exist on the backend (GET
  /api/hunter/companies, GET /api/hunter/companies/:id/jobs). The real backend uses POST with search
  parameters.

  Improvement: Beyond just wiring up (covered above), the Hunter page should:
  - Add search filters UI (location input, company type dropdown, keywords input) since the backend
  requires these parameters.
  - Show loading skeletons while fetching companies/jobs.
  - Support paginating through large job result sets.
  - Display the full analysis result (ATS score, match score, and per-field feedback) in an organized
  layout rather than a single blob.

  ---
  7. AI Feedback Accept Endpoint Path Mismatch

  Issue: resumeService.js calls POST /api/resumes/:id/feedback/accept-all but the backend for AI-generated
   feedback uses POST /api/resumes/:id/ai-feedback/accept-all (note: /ai-feedback/ not /feedback/).

  Improvement:
  - Add a separate acceptAiFeedback(resumeId, comments, autoRegenerate) method that calls the correct
  /ai-feedback/accept-all path.
  - Keep the existing acceptAllFeedback(resumeId) for professor feedback (which uses
  /feedback/accept-all).
  - Wire acceptAiFeedback into both the Hunter and Report pages where AI suggestions are accepted.

  ---
  8. Profile Page — Real API Integration

  Current state: Profile.jsx appears to use mock data for profile display/edit.

  Improvement:
  - Wire the existing authService.getProfile() and authService.updateProfile() calls into the Profile
  page.
  - Show real user data (name, email, role) on load.
  - Make inline edits persist via PATCH /auth/profile.

  ---
  9. Resume Details — Missing autoRegenerate on Feedback Accept

  Issue: When a student accepts faculty feedback via POST /api/resumes/:id/feedback/accept-all, the
  backend supports { autoRegenerate: true } to automatically regenerate the PDF. The frontend doesn't pass
   this flag.

  Improvement:
  - Add a checkbox or confirmation prompt: "Regenerate resume after applying feedback?"
  - Pass { autoRegenerate: true } in the body when the student wants immediate regeneration, saving them
  from manually clicking "Generate" again.

  ---
  10. Notification Deep-Linking

  Current state: Notifications link to relevant pages, but the links may not navigate to the specific
  resume or feedback item.

  Improvement:
  - When a notification says "Professor X left feedback on your resume", the link should navigate directly
   to that resume's feedback view (e.g., /details/:resumeId?tab=feedback), not just /shared.
  - When a student shares a resume, the professor notification should link to
  /professor/request/:requestId.

  ---
  11. Dashboard — Missing Student Resume Activity

  Current state: StudentDashboard.jsx shows recent job openings. ProfessorDashboard.jsx shows shared
  resumes.

  Improvement:
  - Student dashboard should also show:
    - Recent feedback received (from professors or AI).
    - Resume report scores (latest analysis results).
    - Quick links to resumes that need attention (low scores, unread feedback).
  - Professor dashboard should show:
    - Count of pending reviews (shared but unreviewed resumes).
    - Recently reviewed resumes.

  ---
  12. Template Preview — PDF Viewer Enhancement

  Current state: TemplatePreview.jsx uses DocumentViewer.jsx to show template PDFs.

  Improvement:
  - Allow students to preview how their resume data would look in a template before committing to it.
  - Add a "Use This Template" button directly on the preview page with a title input modal, calling POST
  /api/resumes/from-template.

  ---
  13. Feedback Flow — Support for suggestedValue Diff View

  Current state: Professor feedback and AI suggestions include originalValue and suggestedValue fields,
  but the UI may show them as plain text.

  Improvement:
  - Show a side-by-side or inline diff highlighting what changed between originalValue and suggestedValue.
  - Color-code deletions (red) and additions (green) so students can quickly see the impact of each
  suggestion.

  ---
  14. Resume List — Status Indicators

  Current state: The Resumes page lists all student resumes.

  Improvement:
  - Add status badges: "Draft", "Generated", "Shared", "Feedback Available", "Reviewed".
  - Show the last generated date and last feedback date.
  - Add a "Score" column showing the latest report analysis score if available.

  ---
  Summary Table

  ┌─────┬────────────────────┬─────────┬───────────────────────────────────────────────────┬──────────┐
  │  #  │      Feature       │  Type   │                Backend Endpoint(s)                │ Priority │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 1   │ GitHub Import      │ New     │ /github/preview, /github/resume/:id/import,       │ High     │
  │     │                    │         │ DELETE .../projects/:id                           │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │     │                    │         │ /hunter/companies/dynamic, /hunter/jobs,          │          │
  │ 2   │ Hunter — Real API  │ New     │ /hunter/analyze,                                  │ High     │
  │     │                    │         │ /resumes/:id/ai-feedback/accept-all               │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 3   │ Report — Real API  │ New     │ /report/analyze-resume, /report/accept-feedback   │ High     │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 4   │ ERA Generate       │ New     │ /era/generate                                     │ Medium   │
  │     │ Buttons            │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 5   │ enhanceProjects    │ New     │ /resumes/:id/generate (body param)                │ Low      │
  │     │ Flag               │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 6   │ Hunter UX          │ Improve │ —                                                 │ Medium   │
  │     │ (filters, layout)  │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 7   │ AI Feedback Path   │ Improve │ /resumes/:id/ai-feedback/accept-all               │ High     │
  │     │ Fix                │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 8   │ Profile — Real API │ Improve │ /auth/profile                                     │ Medium   │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 9   │ autoRegenerate on  │ Improve │ /resumes/:id/feedback/accept-all (body param)     │ Low      │
  │     │ Feedback           │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 10  │ Notification       │ Improve │ —                                                 │ Medium   │
  │     │ Deep-Links         │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 11  │ Dashboard          │ Improve │ Existing endpoints                                │ Medium   │
  │     │ Enrichment         │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 12  │ Template Preview   │ Improve │ —                                                 │ Low      │
  │     │ UX                 │         │                                                   │          │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 13  │ Feedback Diff View │ Improve │ —                                                 │ Medium   │
  ├─────┼────────────────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
  │ 14  │ Resume Status      │ Improve │ Existing endpoints                                │ Low      │
  │     │ Indicators         │         │                                                   │          │
  └─────┴────────────────────┴─────────┴───────────────────────────────────────────────────┴──────────┘

  Items 1–3 and 7 are the highest impact — they represent fully-built backend capabilities with zero or
  broken frontend integration. Items 4–5 are quick wins (buttons and parameters already exist). Items 6
  and 8–14 are UX improvements that make existing features more polished.

  Changes
   Summary of All Changes                                                                                  
                                                                                                          
  New Service Files Created (4)                                                                           
                                                                                                        
  ┌──────────────────┬─────────────────────────────────────────────────────────────────────────────────┐
  │       File       │                                    Endpoints                                    │
  ├──────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ githubService.js │ POST /github/preview, POST /github/resume/:id/import, DELETE                    │
  │                  │ /github/resume/:id/projects/:projectId                                          │
  ├──────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ reportService.js │ POST /report/analyze-resume, POST /report/accept-feedback                       │
  ├──────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ eraService.js    │ POST /era/generate                                                              │
  ├──────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ hunterService.js │ Rewritten: POST /hunter/companies/dynamic, POST /hunter/jobs, POST              │
  │                  │ /hunter/analyze                                                                 │
  └──────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

  Service Updates (1)

  ┌──────────────────┬─────────────────────────────────────────────────────────────────────────────────┐
  │       File       │                                     Changes                                     │
  ├──────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ resumeService.js │ Added acceptAiFeedback() for /ai-feedback/accept-all, generatePdfWithOptions()  │
  │                  │ with body params, acceptAllFeedback() now accepts { autoRegenerate }            │
  └──────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

  Pages Fully Rewritten (2)

  ┌────────────┬───────────────────────────────────────────────────────────────────────────────────────┐
  │    Page    │                                     What Changed                                      │
  ├────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │            │ Removed all mock data. Real search flow: location/type/keywords -> companies -> jobs  │
  │ Hunter.jsx │ -> analyze. Shows ATS score, match score, diff view for suggestions. "Update Resume"  │
  │            │ calls /ai-feedback/accept-all.                                                        │
  ├────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │            │ Removed all mock data. Loads real resumes from API. Calls /report/analyze-resume,     │
  │ Report.jsx │ shows 17 criteria with score bars + AI suggestions. "Update Resume" calls             │
  │            │ /report/accept-feedback. Supports ?resumeId= from Resumes page.                       │
  └────────────┴───────────────────────────────────────────────────────────────────────────────────────┘

  Pages Updated (6)

  ┌────────────────────────┬───────────────────────────────────────────────────────────────────────────┐
  │          Page          │                               What Changed                                │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │                        │ Added ERA modal with preview/accept flow. Passes resumeId + onEraGenerate │
  │ Details.jsx            │  to child tabs. Added enhanceProjects toggle for PDF generation. Uses     │
  │                        │ generatePdfWithOptions.                                                   │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ Profile.jsx            │ Replaced mock setTimeout with real authService.getProfile() and           │
  │                        │ authService.updateProfile().                                              │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │                        │ Added originalValue/suggestedValue to feedback data. Shows inline diff    │
  │ StudentShared.jsx      │ view (red strikethrough for original, green for suggested). Passes {      │
  │                        │ autoRegenerate: true } to acceptAllFeedback.                              │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ StudentDashboard.jsx   │ Added "My Resumes" summary section showing recent resumes with status     │
  │                        │ badges (Draft/Shared/Feedback) and click-to-edit.                         │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ ProfessorDashboard.jsx │ Added stats summary cards (Pending/Under Review/Completed/Total counts)   │
  │                        │ at the top.                                                               │
  ├────────────────────────┼───────────────────────────────────────────────────────────────────────────┤
  │ Notifications.jsx      │ Enhanced deep-linking: constructs specific routes from notification       │
  │                        │ type/resumeId when no explicit link exists.                               │
  └────────────────────────┴───────────────────────────────────────────────────────────────────────────┘

  Components Updated (4)

  ┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
  │      Component      │                                 What Changed                                 │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │                     │ Real GitHub import: fetches repos via POST /github/preview, shows selectable │
  │ ProjectsTab.jsx     │  list with descriptions/language, imports selected via POST                  │
  │                     │ /github/resume/:id/import. ERA button wired up.                              │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │ ExperienceTab.jsx   │ ERA "Generate with ERA" button wired to parent callback.                     │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │ ActivityTab.jsx     │ ERA "Generate with ERA" button wired to parent callback.                     │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │ CreateResumeTab.jsx │ Added "Enhance projects to match template format" checkbox controlling       │
  │                     │ enhanceProjects flag.                                                        │
  └─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘

  Additional Improvements (2)

  ┌─────────────────────┬──────────────────────────────────────────────────────────────────────────────┐
  │        Page         │                                 What Changed                                 │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │ Resumes.jsx         │ Resume cards now show status badges (Draft/Shared/Feedback/Generated) and    │
  │                     │ "Updated" date.                                                              │
  ├─────────────────────┼──────────────────────────────────────────────────────────────────────────────┤
  │ TemplatePreview.jsx │ "Use This Template" now opens a title input modal so users can name their    │
  │                     │ resume before creating it.                                                   │
  └─────────────────────┴──────────────────────────────────────────────────────────────────────────────┘