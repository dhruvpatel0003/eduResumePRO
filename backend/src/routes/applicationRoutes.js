const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');

// All application routes require authentication
router.use(authMiddleware);

// Create application
router.post('/', applicationController.create);

// Get user's applications
router.get('/', applicationController.getUserApplications);

// Get single application
router.get('/:id', applicationController.getById);

// Update application status
router.put('/:id/status', applicationController.updateStatus);

// Delete application
router.delete('/:id', applicationController.delete);

module.exports = router;
