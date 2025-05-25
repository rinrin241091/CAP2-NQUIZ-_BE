const express = require('express');
const router = express.Router();
const { listQuestionsByQuizId } = require('../controllers/questionByQuizController');

router.get('/quizzes/:quizId/questions', listQuestionsByQuizId);

module.exports = router;
