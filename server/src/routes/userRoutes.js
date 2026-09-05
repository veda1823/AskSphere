const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

// Update current user's profile (Protected)
router.patch('/profile', authenticateToken, userController.updateProfile);

// Get user profile by ID (Public)
router.get('/:id', userController.getUserProfile);

module.exports = router;
