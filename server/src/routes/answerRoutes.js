const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const authenticateToken = require('../middleware/authMiddleware');

// Post an answer to a question (Protected)
router.post('/questions/:questionId/answers', authenticateToken, answerController.createAnswer);

// Mark an answer as accepted "Brainliest" (Protected - Question Author Only)
router.patch('/answers/:id/accept', authenticateToken, answerController.acceptAnswer);

module.exports = router;
