const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/total-users', dashboardController.getTotalUsers);
router.get('/total-quizzes', dashboardController.getTotalQuizzes);
router.get('/total-plays', dashboardController.getTotalPlay);
router.get('/chart-data', dashboardController.getPerformanceChartData);

module.exports = router;
