const Resume = require('../models/Resume');

const resumeController = {
  // Create new resume
  create: async (req, res) => {
    try {
      const { title, personalInfo, templateId } = req.body;
      
      const resume = new Resume({
        userId: req.user.id,
        title,
        personalInfo,
        templateId
      });

      await resume.save();
      res.status(201).json(resume);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all resumes for a user
  getUserResumes: async (req, res) => {
    try {
      const resumes = await Resume.find({ userId: req.user.id }).populate('templateId');
      res.status(200).json(resumes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get single resume
  getById: async (req, res) => {
    try {
      const resume = await Resume.findById(req.params.id).populate('templateId');
      if (!resume) return res.status(404).json({ message: 'Resume not found' });
      res.status(200).json(resume);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update resume
  update: async (req, res) => {
    try {
      const resume = await Resume.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(200).json(resume);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete resume
  delete: async (req, res) => {
    try {
      await Resume.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Resume deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Publish resume
  publish: async (req, res) => {
    try {
      const resume = await Resume.findByIdAndUpdate(
        req.params.id,
        { isPublished: true },
        { new: true }
      );
      res.status(200).json(resume);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = resumeController;
