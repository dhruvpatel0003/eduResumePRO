const JobOpening = require('../models/JobOpening');

const jobOpeningController = {
  // Get all job openings
  getAll: async (req, res) => {
    try {
      const jobs = await JobOpening.find({ status: 'open' });
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get job by ID
  getById: async (req, res) => {
    try {
      const job = await JobOpening.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create job opening
  create: async (req, res) => {
    try {
      const job = new JobOpening(req.body);
      await job.save();
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update job
  update: async (req, res) => {
    try {
      const job = await JobOpening.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete job
  delete: async (req, res) => {
    try {
      await JobOpening.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = jobOpeningController;
