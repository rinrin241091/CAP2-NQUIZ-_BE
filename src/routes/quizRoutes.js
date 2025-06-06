// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const upload = require('../middleware/upload');
const authenticateJWT = require("../middleware/auth");  // Import middleware

// Route để thêm quiz, chỉ cho phép người dùng đã xác thực
router.post("/", authenticateJWT, upload.single('image'), quizController.store);

// Route để lấy danh sách quiz của user
router.get("/my-quizzes", authenticateJWT, quizController.getUserQuizzes);

router.delete("/delete/:id", quizController.deleteQuiz);

module.exports = router;
