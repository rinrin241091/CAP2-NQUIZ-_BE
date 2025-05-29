const quizService = require('../services/quizAdmin.service');

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = await quizService.createQuiz(req.body);
    res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quiz' });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    await quizService.updateQuiz(req.params.id, req.body);
    res.json({ message: 'Quiz updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quiz' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await quizService.deleteQuiz(req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
};
