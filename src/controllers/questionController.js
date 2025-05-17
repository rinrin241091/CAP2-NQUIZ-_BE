const quizService = require('../services/question.service');

// Tạo quiz mới
const createQuiz = async (req, res) => {
  const { title, description = '', creator_id = 1, is_public = 1 } = req.body;
  try {
    const result = await quizService.createQuiz(title, description, creator_id, is_public);
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz_id: result.insertId },
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message,
    });
  }
};

// Tạo câu hỏi mới
const createQuestion = async (req, res) => {
  const { quiz_id, question_text, question_type, answers, true_false_answer } = req.body;

  if (!quiz_id) {
    return res.status(400).json({
      success: false,
      message: 'quiz_id is required',
    });
  }

  try {
    const result = await quizService.createQuestion(quiz_id, question_text, question_type, answers, true_false_answer);
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question_id: result.question_id },
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message,
    });
  }
};

// Lấy danh sách câu hỏi của một quiz
const getQuizQuestions = async (req, res) => {
  const { quizId } = req.params;
  console.log("Received quizId:", quizId); // Debugging log
  try {
    const questions = await quizService.getQuizQuestions(quizId);
    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    res.status(500).json({
      success: false,
      message: 'Error getting quiz questions',
      error: error.message,
    });
  }
};
const incrementPlayCount = async (req, res) => {
  const { quizId } = req.params;
  console.log("📥 Backend nhận playQuiz với ID:", quizId);
  try {
    await quizService.incrementPlayCount(quizId);
    res.status(200).json({ success: true, message: "Play count and last_played_at updated" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update play count",
      error: error.message,
    });
  }
};

module.exports = {
  createQuiz,
  createQuestion,
  getQuizQuestions,
  incrementPlayCount,
};
