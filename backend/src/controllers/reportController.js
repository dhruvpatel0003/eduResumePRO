// controllers/reportController.js
const Resume = require("../models/Resume");
const { extractResumeText } = require("../utils/hunterService"); // you already have this
const axios = require("axios");
const applyFieldPathUpdate = require("../utils/fieldPathUpdate"); 
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
const { buildReportPrompt } = require("../utils/perplexityService");

class ReportController {
  static async analyzeResume(req, res) {
    try {
      const { resumeId } = req.body;
      if (!resumeId) {
        return res.status(400).json({ success: false, message: "resumeId is required" });
      }

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ success: false, message: "Resume not found" });
      }
      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      const resumeText = extractResumeText(resume.templateInfo);

      const prompt = buildReportPrompt(resumeText);

      const response = await axios.post(
        PERPLEXITY_API_URL,
        {
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume reviewer. You rate resumes and return JSON feedback only."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 3000
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const content = response.data.choices[0].message.content;
      // Perplexity should respond with pure JSON; but be safe:
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      const report = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      return res.json({
        success: true,
        report
      });
    } catch (error) {
      console.error("Report analyze error:", error.response?.data || error.message);
      return res
        .status(500)
        .json({ success: false, message: "Failed to analyze resume" });
    }
  }

  // Accept AI suggestions and update resume + regenerate (reuses pattern you have)
  static async acceptReportFeedback(req, res) {
    try {
      const { resumeId, comments, autoRegenerate = true } = req.body;

      if (!resumeId || !Array.isArray(comments)) {
        return res.status(400).json({
          success: false,
          message: "resumeId and comments array are required"
        });
      }

      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res
          .status(404)
          .json({ success: false, message: "Resume not found" });
      }
      if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      let appliedCount = 0;
      const errors = [];

      for (const comment of comments) {
        try {
          if (!comment.fieldPath || !comment.suggestedValue) continue;
          // single-field / bullet replacement
          applyFieldPathUpdate(
            resume.templateInfo,
            comment.fieldPath,
            comment.suggestedValue
          );
          appliedCount++;
        } catch (e) {
          errors.push(`Failed ${comment.fieldPath}: ${e.message}`);
        }
      }

      if (appliedCount === 0) {
        return res.json({
          success: false,
          message: "No suggestions applied",
          errors
        });
      }

      // Regenerate PDF if requested
      let newPdfUrl = null;
      if (autoRegenerate) {
        const {
          generateResumeWithPerplexity
        } = require("../utils/perplexityService");
        const { convertMarkdownToPDF } = require("../utils/pdfService");
        const { uploadToGridFS } = require("../config/gridfs");

        const markdown = await generateResumeWithPerplexity(resume, "");
        const pdfBuffer = await convertMarkdownToPDF(markdown);

        resume.generatedPdfGridFSId = await uploadToGridFS(
          pdfBuffer,
          `resume_${resume._id}_report_${Date.now()}.pdf`
        );
        resume.generatedAt = new Date();
        newPdfUrl = `/api/resumes/${resume._id}/pdf`;
      }

      await resume.save();

      return res.json({
        success: true,
        feedbackApplied: appliedCount,
        errors,
        regeneratedPdf: autoRegenerate,
        newPdfUrl
      });
    } catch (error) {
      console.error("Report accept error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to apply report feedback" });
    }
  }
}



module.exports = ReportController;
