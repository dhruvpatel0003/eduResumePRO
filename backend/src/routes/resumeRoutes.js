const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/auth');

// All resume routes require authentication
router.use(authMiddleware);

// Create resume
router.post('/', resumeController.create);

// Get all user's resumes
router.get('/', resumeController.getUserResumes);

// Get single resume
router.get('/:id', resumeController.getById);

// Update resume
router.put('/:id', resumeController.update);

// Delete resume
router.delete('/:id', resumeController.delete);

// Publish resume
router.post('/:id/publish', resumeController.publish);

module.exports = router;
