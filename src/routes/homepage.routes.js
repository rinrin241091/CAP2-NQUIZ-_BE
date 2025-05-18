const express = require('express');
const router = express.Router();
const quizController = require('../controllers/homepage.cotroller.js');

router.get('/all', quizController.getAll);
router.get('/random', quizController.getRandomDaily);
router.get('/popular', quizController.getPopularQuizzes);
router.get('/recently-played', quizController.getRecentlyPlayed);


router.get('/:id', quizController.getById);


module.exports = router;
