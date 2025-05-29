const express = require('express');
const router = express.Router();

const answerController = require('../controllers/answerAdmin.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin-only CRUD routes for answers
router.get('/', authMiddleware, adminMiddleware, answerController.getAllAnswers);
router.post('/', authMiddleware, adminMiddleware, answerController.createAnswer);
router.put('/:id', authMiddleware, adminMiddleware, answerController.updateAnswer);
router.delete('/:id', authMiddleware, adminMiddleware, answerController.deleteAnswer);

module.exports = router;
