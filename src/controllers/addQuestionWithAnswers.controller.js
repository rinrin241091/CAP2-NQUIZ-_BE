const { addQuestionWithAnswers, 
        deleteQuestionById, 
        getQuestionById, 
        updateQuestion 
} = require('../services/addQuestionWithAnswers.service');

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
const deleteQuestion = async (req, res) => {
  const questionId = req.params.id;
  try {
    const deleted = await deleteQuestionById(questionId);
    if (deleted === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }
    res.json({ success: true, message: 'Xóa câu hỏi thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa câu hỏi:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa câu hỏi' });
  }
};
const getQuestionByIdCt = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await getQuestionById(id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching question' });
  }
};

const updateQuestionCt = async (req, res) => {
  const { id } = req.params;
  const { question_text, time_limit, question_type_id, answers } = req.body;
  try {
    await updateQuestion(id, question_text, time_limit, question_type_id, answers);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating question' });
  }
};

module.exports = { 
  createQuestionWithAnswers, 
  deleteQuestion, 
  getQuestionByIdCt,
  updateQuestionCt }; 