const quizService = require('../services/quiz.service'); // Sử dụng quizService thay vì model trực tiếp
const uploadToS3 = require('../middleware/aws'); // Đường dẫn đến middleware AWS S3

const store = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  const quizData = req.body;
  const creator_id = req.user.user_id;
  quizData.creator_id = creator_id;
  
  try {
    // Nếu có file ảnh, upload lên S3
    if (req.file) {
  const imageUrl = await uploadToS3(
    req.file.buffer,                 // ✅ dùng buffer
    req.file.originalname,
    req.file.mimetype
  );
  quizData.image = imageUrl;
}


    const newQuiz = await quizService.addQuiz(quizData);
    res.status(201).json({ message: 'Quiz added successfully!', data: newQuiz });
  } catch (error) {
    console.error('Error adding quiz:', error);
    res.status(500).json({ message: 'Error adding quiz', error: error.message });
  }
};

const getUserQuizzes = async (req, res) => {
  try {
    // Lấy user_id từ token đã được decode trong middleware auth
    const userId = req.user.user_id;

    // Sử dụng quizService để lấy quizzes của user
    const quizzes = await quizService.getQuizzesByUserId(userId);

    res.status(200).json({
      status: 'success',
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách quiz',
      error: error.message
    });
  }
};

const getQuizData = async (req, res) => {
    try {
        // Sử dụng quizService để lấy câu hỏi và đáp án
        const questions = await quizService.getQuestionsWithAnswers();
        res.json(questions);
    } catch (err) {
        console.error('Error fetching quiz data:', err);
        res.status(500).send('Error fetching quiz data');
    }
};

const submitAnswer = async (req, res) => {
    const { questionId, answerId, participantId } = req.body;
    try {
        // Sử dụng quizService để kiểm tra đáp án
        const isCorrect = await quizService.checkAnswer(questionId, answerId);
        res.json({ isCorrect });
    } catch (err) {
        console.error('Error submitting answer:', err);
        res.status(500).send('Error submitting answer');
    }
};
const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await quizService.deleteQuizById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting quiz",
      error: error.message,
    });
  }
};
module.exports = {
    getQuizData,
    submitAnswer,
    store,
    getUserQuizzes,
    deleteQuiz
};
