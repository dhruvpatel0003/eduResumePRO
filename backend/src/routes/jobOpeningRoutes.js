const express = require('express');
const router = express.Router();
const jobOpeningController = require('../controllers/jobOpeningController');
const authMiddleware = require('../middleware/auth');

// Get all jobs (public)
router.get('/', jobOpeningController.getAll);

// Get single job (public)
router.get('/:id', jobOpeningController.getById);

// Create job (authenticated)
router.post('/', authMiddleware, jobOpeningController.create);

// Update job (authenticated)
router.put('/:id', authMiddleware, jobOpeningController.update);

// Delete job (authenticated)
router.delete('/:id', authMiddleware, jobOpeningController.delete);

module.exports = router;
