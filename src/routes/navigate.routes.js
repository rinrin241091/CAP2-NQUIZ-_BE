const express = require('express');
const router = express.Router();
const navigateController = require('../controllers/navigate.controller');

router.get('/math', navigateController.getMathQuizzes);
router.get('/literature', navigateController.getLiteratureQuizzes);
router.get('/history', navigateController.getHistoryQuizzes);
router.get('/geography', navigateController.getGeographyQuizzes);
router.get('/physics', navigateController.getPhysicsQuizzes);
router.get('/chemistry', navigateController.getChemistryQuizzes);

module.exports = router;
