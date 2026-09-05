const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authenticateToken = require('../middleware/authMiddleware');

// Public question browsing routes
router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);

// Protected routes (asking requires login)
router.post('/', authenticateToken, questionController.createQuestion);

module.exports = router;
