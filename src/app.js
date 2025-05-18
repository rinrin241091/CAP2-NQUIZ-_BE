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
const HomePageRoutes = require('./routes/homepage.routes');
const categoryRoutes = require("./routes/categoryRoutes");
const addCategoriesRouter = require("./routes/addCategories.routes");


app.use('/user', userRoutes);
app.use('/question', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/home-page', HomePageRoutes);

app.use("/categories", categoryRoutes);


// Sử dụng route cho path /categories
app.use("/categories", addCategoriesRouter);

module.exports = app;

