// app.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/question.routes');
const quizRoutes = require('./routes/quiz.routes');

app.use('/user', userRoutes);
app.use('/question', questionRoutes);
app.use('/quiz', quizRoutes);



module.exports = app;

