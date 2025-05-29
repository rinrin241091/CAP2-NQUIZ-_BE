const { getQuestionsByQuizId } = require('../services/questionByQuizService');

const listQuestionsByQuizId = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const questions = await getQuestionsByQuizId(quizId);
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listQuestionsByQuizId };
