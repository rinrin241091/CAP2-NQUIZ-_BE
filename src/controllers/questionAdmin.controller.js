const questionService = require('../services/questionAdmin.service');

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};


exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = await questionService.createQuestion(req.body);
    res.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    await questionService.updateQuestion(req.params.id, req.body);
    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await questionService.deleteQuestion(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question' });
  }
};
