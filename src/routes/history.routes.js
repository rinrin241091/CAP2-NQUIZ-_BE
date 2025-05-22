const express = require('express');
const router = express.Router();
const quizController = require('../controllers/history.controller');

// Lấy lịch sử tất cả quiz đã chơi (theo user_id)
router.get('/creator/:creatorId', quizController.getQuizzesHistory);

// Lấy review mới nhất của user theo quiz
router.get("/review/:userId/:quizId", quizController.getQuizReview);

// NEW: Lấy danh sách các lần chơi của một user theo quiz
router.get("/attempts/:userId/:quizId", quizController.getQuizAttemptsByUserAndQuiz);

// NEW: Lấy review chi tiết của 1 session cụ thể
router.get("/review/by-session/:sessionId/:userId", quizController.getQuizReviewBySession);

module.exports = router;
