const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.post('/from-template', resumeController.createFromTemplate);
router.get('/:resumeId/details', resumeController.getResumeDetails);
router.put('/:resumeId/details', resumeController.updateResumeDetails);

module.exports = router;
