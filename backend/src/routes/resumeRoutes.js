const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Student-only core resume actions
router.post('/from-template', resumeController.createFromTemplate);
router.get('/my-resumes', resumeController.listMyResumes);
router.get('/:resumeId/details', resumeController.getResumeDetails);
router.put('/:resumeId/details', resumeController.updateResumeDetails);

// Generation / PDF
router.post('/:resumeId/generate', resumeController.generateResumePDF);
router.get('/:resumeId/pdf', resumeController.getGeneratedResumePDF);

// Sharing & feedback
router.post('/:resumeId/share', resumeController.shareResumeWithProfessor);
router.get('/faculty/resumes', resumeController.listSharedResumesForFaculty);
router.post('/:resumeId/feedback', resumeController.addFacultyFeedback);
router.get('/:resumeId/feedback', resumeController.getFeedbackFromFaculty);
router.post('/:resumeId/feedback/accept-all', resumeController.acceptAllFeedback);
router.post('/:resumeId/ai-feedback/accept-all', resumeController.acceptAIFeedback);

module.exports = router;
