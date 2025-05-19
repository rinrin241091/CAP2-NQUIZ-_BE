const { addQuestionWithAnswers } = require('../services/addQuestionWithAnswers.service');

const createQuestionWithAnswers = async (req, res) => {
  try {
    const { quizId, questionTypeId, questionText, timeLimit, points, answers } = req.body;
    // answers: [{ answer_text, is_correct }, ...]

    await addQuestionWithAnswers(quizId, questionTypeId, questionText, timeLimit, points, answers);
    res.status(201).json({ message: 'Thêm câu hỏi và đáp án thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createQuestionWithAnswers }; 