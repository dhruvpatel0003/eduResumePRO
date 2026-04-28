const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');

// Protect all application routes
router.use(authMiddleware);

// Create new application
router.post('/', applicationController.createApplication);

// Get all applications for the logged-in user
router.get('/', applicationController.getApplications);

// Get a specific application by ID
router.get('/:id', applicationController.getApplicationById);

// Update application status
router.put('/:id/status', applicationController.updateApplicationStatus);

// Withdraw/Delete an application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
