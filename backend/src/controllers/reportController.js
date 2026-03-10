// controllers/reportController.js
const Resume = require("../models/Resume");
const { extractResumeText } = require("../utils/hunterService"); // you already have this
const axios = require("axios");
const applyFieldPathUpdate = require("../utils/fieldPathUpdate"); 
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

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

function buildReportPrompt(resumeText) {
  return `
Analyze the following resume text and rate it on these criteria:

1. Spellings & Grammar
2. Sections
3. Experience Chronological Order
4. Experience Details
5. Educational Details
6. Skill Relevance
7. CourseWork
8. Skill Match
9. Competency Match
10. Font Size & Choice
11. Margins
12. Line Spacing
13. Bullet Point Format
14. Date Format
15. Length
16. Contact Information
17. Pronouns

For each criterion, give a score from 0-100 and 1-2 sentence feedback.

THEN propose specific, small edits to improve the resume at the field/bullet level. 
Each suggestion must target an existing field path in the JSON schema (experience[i].bullets[j], education[i].degree, skills[k], etc.) and replace only that string with a better version.

Resume text:
${resumeText.substring(0, 4000)}

Return ONLY valid JSON in this exact structure:

{
  "overallScore": 82,
  "criteria": [
    {
      "name": "Spellings & Grammar",
      "score": 90,
      "feedback": "Short comment here.",
      "autoFixAvailable": false
    }
  ],
  "aiSuggestions": [
    {
      "fieldPath": "experience[0].bullets[1]",
      "type": "suggestion",
      "originalValue": "Existing text exactly as in the resume",
      "suggestedValue": "Improved SINGLE-LINE version with action verb and metrics",
      "note": "Why this is better."
    }
  ]
}

Rules:
- suggestedValue MUST be a single-line string (no line breaks).
- Do NOT rewrite entire sections; only edit individual bullets/fields.
- Keep feedback professional and ATS-friendly.
`;
}

module.exports = ReportController;
