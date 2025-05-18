const express = require('express');
const router = express.Router();
const questionTypeController = require('../controllers/questionType.controller');

// GET /api/question-types
router.get('/', questionTypeController.getAllQuestionTypes);

module.exports = router;
