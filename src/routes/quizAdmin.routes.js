const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizAdmin.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin-only CRUD routes for quizzes
router.get('/', authMiddleware, adminMiddleware, quizController.getAllQuizzes);
router.post('/', authMiddleware, adminMiddleware, quizController.createQuiz);
router.put('/:id', authMiddleware, adminMiddleware, quizController.updateQuiz);
router.delete('/:id', authMiddleware, adminMiddleware, quizController.deleteQuiz);

module.exports = router;
