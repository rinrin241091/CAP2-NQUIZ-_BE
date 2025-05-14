
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');


router.get('/questions', quizController.getQuizData);
router.post('/submit-answer', quizController.submitAnswer);

module.exports = router;
