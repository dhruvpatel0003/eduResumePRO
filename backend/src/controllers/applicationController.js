const Application = require('../models/Application');

const applicationController = {
  // Create application
  create: async (req, res) => {
    try {
      const { resumeId, jobOpeningId, coverLetter } = req.body;

      const application = new Application({
        userId: req.user.id,
        resumeId,
        jobOpeningId,
        coverLetter
      });

      await application.save();
      await application.populate('jobOpeningId resumeId');
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user applications
  getUserApplications: async (req, res) => {
    try {
      const applications = await Application.find({ userId: req.user.id })
        .populate('jobOpeningId resumeId');
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get application by ID
  getById: async (req, res) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate('jobOpeningId resumeId userId');
      if (!application) return res.status(404).json({ message: 'Application not found' });
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update application status
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete application
  delete: async (req, res) => {
    try {
      await Application.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Application deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = applicationController;
