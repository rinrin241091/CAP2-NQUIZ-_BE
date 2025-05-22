const quizService = require('../services/history.services');

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getQuizzesHistory = async (req, res) => {
  try {
    const creatorId = req.params.creatorId; 
    const quizzes = await quizService.getQuizzesHistory(creatorId);
    const formatted = quizzes.map((quiz) => ({
      ...quiz,
      play_date: formatDate(quiz.play_time),
    }));
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy quiz', error: error.message });
  }
};

const getQuizReview = async (req, res) => {
  const { quizId, userId } = req.params;
  try {
    const result = await quizService.getQuizReview(quizId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu review", error: err.message });
  }
};

const getQuizAttemptsByUserAndQuiz = async (req, res) => {
  const { userId, quizId } = req.params;
  try {
    const attempts = await quizService.getQuizAttemptsByUserAndQuiz(userId, quizId);
    res.status(200).json({ success: true, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách các lần chơi", error: err.message });
  }
};

const getQuizReviewBySession = async (req, res) => {
  const { sessionId, userId } = req.params;
  try {
    const result = await quizService.getQuizReviewBySession(sessionId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy review theo session", error: err.message });
  }
};

module.exports = {
  getQuizzesHistory,
  getQuizReview,
  getQuizAttemptsByUserAndQuiz,
  getQuizReviewBySession,
};
