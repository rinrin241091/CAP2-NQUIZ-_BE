// app.js
const express = require("express");
const cors = require("cors");
const app = express();
const authMiddleware = require("./middleware/auth"); // Import middleware xác thực JWT

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRoutes = require("./routes/user.routes");
const questionRoutes = require("./routes/question.routes");
const quizRoutes = require("./routes/quizRoutes");
const HomePageRoutes = require("./routes/homepage.routes");
const categoryRoutes = require("./routes/categoryRoutes");
const addCategoriesRouter = require("./routes/addCategories.routes");

const questionTypeRoutes = require("./routes/questionType.routes");
const addQuestionWithAnswersRoute = require("./routes/addQuestionWithAnswers.route");

const aiRoutes = require("./routes/ai.routes");
const gameRoutes = require("./routes/gameRoutes");

const dashboardRoutes = require('./routes/dashboard.routes');

const historyRoutes = require('./routes/history.routes');

const navigateRoutes = require('./routes/navigate.routes');

app.use('/api/dashboard', dashboardRoutes);


app.use("/user", userRoutes);

app.use("/question", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/home-page", HomePageRoutes);
app.use("/game", gameRoutes);
app.use("/categories", categoryRoutes);

// Sử dụng route cho path /categories
app.use("/categories", addCategoriesRouter);

app.use("/api/ai", aiRoutes);

app.use("/api/question-types", questionTypeRoutes);

app.use("/api", addQuestionWithAnswersRoute);

app.use("/history", historyRoutes);

app.use("/navigate", navigateRoutes);

module.exports = app;
