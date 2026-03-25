const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password-verify/:token', authController.verifyResetToken);
router.post('/reset-password/:token', authController.resetPassword);
router.put('/profile', authController.updateProfile);

module.exports = router;
