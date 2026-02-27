const express = require('express');
const auth = require('../middleware/auth');
const DescriptionController = require('../controllers/descriptionController');

const router = express.Router();

router.use(auth);
router.post('/generate', DescriptionController.generateDescription);
module.exports = router;
