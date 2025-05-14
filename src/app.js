// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const authMiddleware = require('./middleware/auth');  // Import middleware xác thực JWT



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/question.routes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/user', userRoutes);
app.use('/question', questionRoutes);
// app.use('/quiz', quizRoutes);
app.use('/api/quizzes', quizRoutes);


module.exports = app;

