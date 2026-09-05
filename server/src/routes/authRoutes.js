const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected auth routes
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
