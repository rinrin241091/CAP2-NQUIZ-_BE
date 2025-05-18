const questionTypeService = require('../services/questionType.service');

const getAllQuestionTypes = async (req, res) => {
  try {
    const types = await questionTypeService.getQuestionTypes();
    res.status(200).json(types);
  } catch (error) {
    console.error('Error fetching question types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllQuestionTypes };
