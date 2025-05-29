const express = require('express');
const router = express.Router();
const { 
    createQuestionWithAnswers, 
    deleteQuestion, 
    getQuestionByIdCt,
    updateQuestionCt 
} = require('../controllers/addQuestionWithAnswers.controller');

router.post('/questions', createQuestionWithAnswers);
router.get('/questions/:id', getQuestionByIdCt);
router.put('/questions/:id' ,updateQuestionCt);
router.delete('/questions/:id',deleteQuestion);

module.exports = router; 