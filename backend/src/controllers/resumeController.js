const Resume = require("../models/Resume");
const Template = require("../models/Template");
const { getFileBufferFromGridFS } = require("../config/gridfs");
// const pdfParse = require("pdf-parse");
// const { deriveSectionsFromPdfText } = require('../utils/sections');

const DEFAULT_SECTIONS = [
  'personalInfo',
  'education', 
  'experience',
  'skills',
  'projects',
  'certifications'
];

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
        "name description pdfGridFSId"
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
        sections,          // tabs for UI
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
};


module.exports = resumeController;






