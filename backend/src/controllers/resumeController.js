const Resume = require("../models/Resume");
const Template = require("../models/Template");
const { getFileBufferFromGridFS, uploadToGridFS } = require("../config/gridfs");
const { generateResumeWithPerplexity } = require("../utils/perplexityService");
const { convertMarkdownToPDF } = require("../utils/pdfService");
const { enhanceProjectDescriptions } = require("../utils/projectEnhancer");
// const pdfParse = require("pdf-parse");
// const { deriveSectionsFromPdfText } = require('../utils/sections');

const DEFAULT_SECTIONS = [
  "personalInfo",
  "education",
  "experience",
  "skills",
  "projects",
  "certifications",
];
function applyFieldPathUpdate(rootObj, fieldPath, newValue) {
  if (!rootObj || !fieldPath) return;

  const segments = fieldPath
    .replace(/\]/g, "")
    .split(".")
    .map((s) => s.replace("[", "."))
    .join(".")
    .split(".");

  let obj = rootObj;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (obj == null || !(key in obj)) return; // invalid path, ignore
    obj = obj[key];
  }
  const lastKey = segments[segments.length - 1];
  if (obj != null) {
    obj[lastKey] = newValue;
  }

}

const resumeController = {
  createFromTemplate: async (req, res) => {
    try {
      const { templateId, title } = req.body;

      if (!templateId) {
        return res.status(400).json({ message: "templateId is required" });
      }

      const template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // 1) Load professor PDF from GridFS
      // const pdfBuffer = await getFileBufferFromGridFS(
      //   template.pdfGridFSId.toString()
      // );

      // <<<>>> FUTURE WORK  NEED TO BE DYNAMIC || fACING ISSUE WITH PDF PARSING <<<>>>
      // 2) Extract text from PDF
      // const pdfData = await pdfParse(pdfBuffer);
      // const pdfText = pdfData.text || "";

      // // 3) Derive sections (tabs) from PDF text
      // const sections = deriveSectionsFromPdfText(pdfText);
      const sections = DEFAULT_SECTIONS;
      // 4) Build empty templateInfo matching those sections
      const defaultTemplateInfo = {
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          location: "",
          summary: "",
          links: [],
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        atsScore: 0,
        updatedAt: new Date(),
        title: title || `${template.name} – Resume`,
      };

      const resume = await Resume.create({
        userId: req.user.id,
        templateId: template._id,
        templateInfo: defaultTemplateInfo,
      });

      // Note: template doesn’t store sections; we return them derived.
      res.status(201).json({
        message: "Resume created from template",
        resume: {
          _id: resume._id,
          userId: resume.userId,
          templateId: template._id,
          templateInfo: resume.templateInfo,
          templateMeta: {
            name: template.name,
            description: template.description,
          },
          sections, // tabs for UI
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  getResumeDetails: async (req, res) => {
    try {
      const { resumeId } = req.params;

      const resume = await Resume.findById(resumeId).populate(
        "templateId",
        "name description pdfGridFSId",
      );

      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const template = resume.templateId;

      // <<<>>> FUTURE WORK  NEED TO BE DYNAMIC || fACING ISSUE WITH PDF PARSING <<<>>>
      // 1) Load professor PDF from GridFS again (or you could cache)
      // const pdfBuffer = await getFileBufferFromGridFS(
      //   template.pdfGridFSId.toString()
      // );

      // // 2) Extract text
      // const pdfData = await pdfParse(pdfBuffer);
      // const pdfText = pdfData.text || "";

      // // 3) Derive sections for tabs
      // const sections = deriveSectionsFromPdfText(pdfText);
      const sections = DEFAULT_SECTIONS;
      res.status(200).json({
        resumeId: resume._id,
        template: {
          id: template._id,
          name: template.name,
          description: template.description,
        },
        sections, // tabs for UI
        templateInfo: resume.templateInfo, // what the student filled so far
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateResumeDetails: async (req, res) => {
    try {
      const { resumeId } = req.params;
      const { templateInfo } = req.body;

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      resume.templateInfo = {
        ...resume.templateInfo,
        ...templateInfo,
        updatedAt: new Date(),
      };

      await resume.save();

      res.status(200).json({
        message: "Resume details updated",
        resume,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  generateResumePDF: async (req, res) => {
    try {
      const { resumeId } = req.params;
      const { enhanceProjects } = req.body;
      const resume = await Resume.findById(resumeId).populate("templateId");
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check if data is filled
      if (!resume.templateInfo.personalInfo.fullName) {
        return res.status(400).json({
          message: "Please fill personal information first",
        });
      }

      if (enhanceProjects && resume.templateInfo.projects.length > 0) {
        console.log("✨ Enhancing GitHub project descriptions...");
        resume.templateInfo.projects = await enhanceProjectDescriptions(
          resume.templateInfo.projects,
        );
        await resume.save();
      }

      // **1. Get professor template as visual reference**
      let templateInstructions = "";
      let templatePdfBuffer = null;

      if (resume.templateId && resume.templateId.pdfGridFSId) {
        console.log("📄 Loading professor template for AI analysis...");
        templatePdfBuffer = await getFileBufferFromGridFS(
          resume.templateId.pdfGridFSId.toString(),
        );
        templateInstructions = `
**TEMPLATE TO MATCH EXACTLY:**
- Name: ${resume.templateId.name}
- Description: ${resume.templateId.description || "Professional layout"}
- Analyze uploaded PDF for: section order, fonts, spacing, bullet styles, margins
        `;
      }

      // **2. Generate with Perplexity AI**
      console.log("🤖 Calling Perplexity AI with template reference...");
      const markdownResume = await generateResumeWithPerplexity(
        resume,
        templateInstructions,
        templatePdfBuffer,
      );

      // **3. Convert to PDF**
      console.log("📄 Converting AI content to PDF...");
      const pdfBuffer = await convertMarkdownToPDF(markdownResume);

      // **4. Save generated resume to GridFS**
      console.log("💾 Saving generated resume to GridFS...");
      const filename = `resume_${resume.userId}_${resume._id}_${Date.now()}.pdf`;
      const gridFSId = await uploadToGridFS(pdfBuffer, filename);

      // **5. Update resume with generated PDF reference**
      resume.generatedPdfGridFSId = gridFSId;
      resume.generatedAt = new Date();
      await resume.save();

      res.json({
        success: true,
        message: `Resume generated matching "${resume.templateId?.name || "custom"} template!`,
        resumeId: resume._id,
        pdfId: gridFSId.toString(),
        templateUsed: resume.templateId?.name || "Custom",
        downloadUrl: `/api/resumes/${resumeId}/pdf`,
      });
    } catch (err) {
      console.error("Generate resume error:", err);
      res.status(500).json({ message: "Failed to generate resume PDF" });
    }
  },
  getGeneratedResumePDF: async (req, res) => {
    try {
      const { resumeId } = req.params;

      const resume = await Resume.findById(resumeId).populate("templateId");
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (!resume.generatedPdfGridFSId) {
        return res.status(404).json({
          message: "Resume not generated yet. Click 'Generate Resume' first.",
        });
      }

      const { downloadFromGridFS } = require("../config/gridfs");
      const stream = downloadFromGridFS(resume.generatedPdfGridFSId.toString());

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${resume.templateInfo.personalInfo.fullName || "resume"}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      });

      stream.on("error", (err) => {
        console.error("GridFS stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to load PDF" });
        }
      });

      stream.pipe(res);
    } catch (err) {
      console.error("Get resume PDF error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to get resume PDF" });
      }
    }
  },
  listMyResumes: async (req, res) => {
    try {
      const resumes = await Resume.find({ userId: req.user.id })
        .populate("templateId", "name description")
        .sort({ updatedAt: -1 })
        .limit(10);

      res.json({
        success: true,
        resumes: resumes.map((r) => ({
          _id: r._id,
          title: r.templateInfo.title,
          templateName: r.templateId?.name || "Custom",
          generated: !!r.generatedPdfGridFSId,
          generatedAt: r.generatedAt,
          updatedAt: r.templateInfo.updatedAt,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  shareResumeWithProfessor: async (req, res) => {
    const { resumeId } = req.params;
    const { facultyId } = req.body;

    if (req.user.role.toLowerCase() !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can share resumes with professors" });
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const already = resume.reviewers.find(
      (r) => r.facultyId.toString() === facultyId,
    );
    if (!already) {
      resume.reviewers.push({
        facultyId,  
        status: "pending",
        sharedAt: new Date(),
      });
      await resume.save();
    }

    res.json({ message: "Resume shared with faculty", resumeId: resume._id });
  },
  listSharedResumesForFaculty: async (req, res) => {
    const facultyId = req.user.id;
    if (req.user.role.toLowerCase() !== "faculty") {
      return res
        .status(403)
        .json({ message: "Only faculty can view shared resumes" });
    }
    const resumes = await Resume.find({ "reviewers.facultyId": facultyId })
      .populate("userId", "name email")
      .select("templateInfo.title reviewers generatedPdfGridFSId");

    res.json({
      resumes: resumes.map((r) => {
        const reviewer = r.reviewers.find(
          (rv) => rv.facultyId.toString() === facultyId,
        );
        return {
          resumeId: r._id,
          student: r.userId,
          title: r.templateInfo.title,
          status: reviewer?.status,
          sharedAt: reviewer?.sharedAt,
        };
      }),
    });
  },
  addFacultyFeedback: async (req, res) => {
    const { resumeId } = req.params;
    const { comments } = req.body;

    if (req.user.role.toLowerCase() !== "faculty") {
      return res
        .status(403)
        .json({ message: "Only faculty can add feedback to resumes" });
    }

    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ message: "comments array required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Check faculty is an assigned reviewer
    const reviewer = resume.reviewers.find(
      (r) => r.facultyId.toString() === req.user.id,
    );
    if (!reviewer) {
      return res
        .status(403)
        .json({ message: "Not a reviewer for this resume" });
    }

    reviewer.status = "viewed";

    resume.feedbackThreads.push({
      facultyId: req.user.id,
      comments: comments.map((c) => ({
        ...c,
        status: "pending",
        createdAt: new Date(),
      })),
    });

    await resume.save();

    res.json({ message: "Feedback submitted", resumeId: resume._id });
  },
  getFeedbackFromFaculty: async (req, res) => {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId).populate(
      "feedbackThreads.facultyId",
      "name email",
    );

    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      resumeId: resume._id,
      feedbackThreads: resume.feedbackThreads,
    });
  },
  // controllers/resumeController.js - UPDATED acceptAllFeedback WITH AUTO-REGENERATION
  acceptAllFeedback: async (req, res) => {
    const { resumeId } = req.params;
    const { autoRegenerate } = req.body; // NEW: Optional flag

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let appliedCount = 0;
    let allReviewersCompleted = true;

    // 1️⃣ Apply ALL feedback suggestions
    for (const thread of resume.feedbackThreads) {
      let threadHasPending = false;

      for (const comment of thread.comments) {
        if (comment.status === "pending" && comment.suggestedValue) {
          applyFieldPathUpdate(
            resume.templateInfo,
            comment.fieldPath,
            comment.suggestedValue,
          );
          comment.status = "accepted";
          appliedCount++;
        } else if (comment.status === "pending") {
          threadHasPending = true;
        }
      }

      if (threadHasPending) {
        allReviewersCompleted = false;
      }
    }

    // 2️⃣ Mark reviewers as completed
    if (allReviewersCompleted) {
      resume.reviewers.forEach((reviewer) => {
        if (reviewer.status !== "completed") {
          reviewer.status = "completed";
          reviewer.completedAt = new Date();
        }
      });
    }

    // 3️⃣ Update timestamps
    resume.templateInfo.updatedAt = new Date();

    // 4️⃣ AUTO-REGENERATE PDF (if requested)
    let newPdfId = null;
    if (autoRegenerate) {
      console.log("🔄 Auto-regenerating PDF after feedback...");

      // Clear old PDF reference first
      resume.generatedPdfGridFSId = undefined;
      resume.generatedAt = undefined;

      // Generate NEW PDF with updated content
      const {
        generateResumeWithPerplexity,
      } = require("../utils/perplexityService");
      const { convertMarkdownToPDF } = require("../utils/pdfService");
      const { uploadToGridFS } = require("../config/gridfs");

      let templateInstructions = "";
      if (resume.templateId) {
        templateInstructions = `
**UPDATED CONTENT FROM FACULTY FEEDBACK** - Regenerating with latest accepted changes.
- Template: ${resume.templateId.name}
- Follow same structure and style.
      `;
      }

      const markdownResume = await generateResumeWithPerplexity(
        resume,
        templateInstructions,
      );
      const pdfBuffer = await convertMarkdownToPDF(markdownResume);

      const filename = `resume_${resume.userId}_${resume._id}_feedback-accepted_${Date.now()}.pdf`;
      const gridFSId = await uploadToGridFS(pdfBuffer, filename);

      // Update with NEW PDF
      resume.generatedPdfGridFSId = gridFSId;
      resume.generatedAt = new Date();
      newPdfId = gridFSId.toString();
    } else {
      // Just mark PDF as stale (manual regeneration needed)
      resume.generatedPdfGridFSId = undefined;
      resume.generatedAt = undefined;
    }

    await resume.save();

    res.json({
      success: true,
      message: `✅ Applied ${appliedCount} feedback suggestions`,
      resumeId: resume._id,
      feedbackApplied: appliedCount,
      reviewersCompleted: allReviewersCompleted,
      regeneratedPdf: newPdfId ? true : false,
      newPdfId: newPdfId || null,
      downloadUrl: newPdfId ? `/api/resumes/${resumeId}/pdf` : null,
      needsManualRegeneration: !autoRegenerate,
    });
  },
};

module.exports = resumeController;
