const questionTypeModel = require('../models/questionType.model');

const getQuestionTypes = () => {
  return questionTypeModel.getAllQuestionTypes();
};

module.exports = { getQuestionTypes };
