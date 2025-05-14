const quizService = require('../services/quiz.service');

const getQuizData = async (req, res) => {
    try {
        const questions = await quizService.getQuestionsWithAnswers();
        res.json(questions);
    } catch (err) {
        res.status(500).send('Error fetching quiz data');
    }
};

const submitAnswer = async (req, res) => {
    const { questionId, answerId, participantId } = req.body;
    try {
        const isCorrect = await quizService.checkAnswer(questionId, answerId);
        res.json({ isCorrect });
    } catch (err) {
        res.status(500).send('Error submitting answer');
    }
};

module.exports = {
    getQuizData,
    submitAnswer
};
