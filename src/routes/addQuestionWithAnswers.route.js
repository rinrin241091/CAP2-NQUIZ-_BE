const express = require('express');
const router = express.Router();
const { createQuestionWithAnswers } = require('../controllers/addQuestionWithAnswers.controller');

router.post('/questions', createQuestionWithAnswers);

module.exports = router; 