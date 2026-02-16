const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/auth');

// All feedback routes require authentication
router.use(authMiddleware);

// Create feedback (professor)
router.post('/', feedbackController.create);

// Get feedback for a resume
router.get('/resume/:resumeId', feedbackController.getByResumeId);

// Get all feedback for current student
router.get('/', feedbackController.getStudentFeedback);

// Update feedback
router.put('/:id', feedbackController.update);

// Delete feedback
router.delete('/:id', feedbackController.delete);

module.exports = router;
