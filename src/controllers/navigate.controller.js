const navigateServices = require('../services/navigate.service');

const getMathQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesMath();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching math quizzes', error: error.message });
  }
};

const getLiteratureQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesLiterature();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching literature quizzes', error: error.message });
  }
};

const getHistoryQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesHistory();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history quizzes', error: error.message });
  }
};

const getGeographyQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesGeography();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching geography quizzes', error: error.message });
  }
};

const getPhysicsQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesPhysics();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching physics quizzes', error: error.message });
  }
};

const getChemistryQuizzes = async (req, res) => {
  try {
    const quizzes = await  navigateServices.getAllQuizzesChemistry();
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chemistry quizzes', error: error.message });
  }
};

module.exports = {
  getMathQuizzes,
  getLiteratureQuizzes,
  getHistoryQuizzes,
  getGeographyQuizzes,
  getPhysicsQuizzes,
  getChemistryQuizzes
};
