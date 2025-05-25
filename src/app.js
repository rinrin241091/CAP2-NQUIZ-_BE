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
const categoryRoutes = require("./routes/categoryRoutes");
const addCategoriesRouter = require("./routes/addCategories.routes");
const questionTypeRoutes = require('./routes/questionType.routes');
const addQuestionWithAnswersRoute = require('./routes/addQuestionWithAnswers.route');
const questionByQuizRoute = require('./routes/questionByQuizRoute');

app.use('/user', userRoutes);

app.use('/question', questionRoutes);
// app.use('/quiz', quizRoutes);
app.use('/api/quizzes', quizRoutes);

app.use("/categories", categoryRoutes);

// Sử dụng route cho path /categories
app.use("/categories", addCategoriesRouter);

app.use('/api/question-types', questionTypeRoutes);

app.use('/api', addQuestionWithAnswersRoute);

app.use('/api', questionByQuizRoute);

module.exports = app;

