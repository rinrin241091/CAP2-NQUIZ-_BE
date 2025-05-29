const answerService = require('../services/answerAdmin.service');

exports.getAllAnswers = async (req, res) => {
  try {
    const answers = await answerService.getAllAnswers();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch answers' });
  }
};

exports.createAnswer = async (req, res) => {
  try {
    const newAnswer = await answerService.createAnswer(req.body);
    res.status(201).json({ message: 'Answer created successfully', answer: newAnswer });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create answer' });
  }
};

exports.updateAnswer = async (req, res) => {
  try {
    await answerService.updateAnswer(req.params.id, req.body);
    res.json({ message: 'Answer updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update answer' });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    await answerService.deleteAnswer(req.params.id);
    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete answer' });
  }
};
