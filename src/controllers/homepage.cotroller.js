const quizService = require('../services/homepage.service.js');

const getAll = async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRandomDaily = async (req, res) => {
  try {
    const quizzes = await quizService.getRandomQuizzesEachDay();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getPopularQuizzes = async (req, res) => {
  try {
    const quizzes = await quizService.getMostUsedQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getRecentlyPlayed = async (req, res) => {
  try {
    const quizzes = await quizService.getRecentlyPlayedQuizzes();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  getRandomDaily,
  getPopularQuizzes,
  getRecentlyPlayed
};
