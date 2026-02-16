const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middleware/auth');

// Get all templates (public)
router.get('/', templateController.getAll);

// Get single template (public)
router.get('/:id', templateController.getById);

// Create template (authenticated)
router.post('/', authMiddleware, templateController.create);

// Update template (authenticated)
router.put('/:id', authMiddleware, templateController.update);

// Delete template (authenticated)
router.delete('/:id', authMiddleware, templateController.delete);

module.exports = router;
