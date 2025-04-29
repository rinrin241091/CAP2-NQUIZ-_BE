const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv'); // Đảm bảo dotenv được cài đặt để sử dụng biến môi trường
const authMiddleware = require('./middleware/auth');  // Import middleware xác thực JWT

// Import route
const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/question.routes');
const quizRoutes = require("./routes/quizRoutes");

// Tải các biến môi trường từ .env
dotenv.config();

app.use(express.json());  // Để nhận dữ liệu JSON từ client
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount router
app.use('/user', userRoutes);

// Bảo vệ route "/question" với middleware authMiddleware
// Các route trong "/question" yêu cầu xác thực
app.use('/question', authMiddleware, questionRoutes);

// Bảo vệ route "/api/quizzes" với middleware authMiddleware
// Các route trong "/api/quizzes" yêu cầu xác thực
app.use('/api/quizzes', authMiddleware, quizRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
