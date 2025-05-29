const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionAdmin.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin-only CRUD routes for questions
router.get('/', authMiddleware, adminMiddleware, questionController.getAllQuestions);
router.post('/', authMiddleware, adminMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, questionController.deleteQuestion);

module.exports = router;
