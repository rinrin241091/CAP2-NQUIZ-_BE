const quizService = require('../services/homepage.service.js');


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

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
const getQuizzesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const quizzes = await quizService.getQuizzesByUser(userId);

    // Format ngày cho từng quiz
    const formatted = quizzes.map((quiz) => ({
      ...quiz,
      create_date: formatDate(quiz.date || quiz.created_at), // đổi theo trường bạn dùng
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get quizzes", error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  getRandomDaily,
  getPopularQuizzes,
  getRecentlyPlayed,
  getQuizzesByUser
};
