const Feedback = require('../models/Feedback');

const feedbackController = {
  // Create feedback (professor)
  create: async (req, res) => {
    try {
      const { resumeId, studentId, overallRating, comments, suggestions, strengths, areasForImprovement } = req.body;

      const feedback = new Feedback({
        resumeId,
        studentId,
        professorId: req.user.id,
        overallRating,
        comments,
        suggestions,
        strengths,
        areasForImprovement,
        status: 'submitted'
      });

      await feedback.save();
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get feedback for a resume
  getByResumeId: async (req, res) => {
    try {
      const feedback = await Feedback.find({ resumeId: req.params.resumeId })
        .populate('professorId', 'name email')
        .populate('studentId', 'name email');
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all feedback for a student
  getStudentFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.find({ studentId: req.user.id })
        .populate('resumeId')
        .populate('professorId', 'name email');
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update feedback
  update: async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete feedback
  delete: async (req, res) => {
    try {
      await Feedback.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Feedback deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = feedbackController;
