// models/quizModel.js
const db = require('../config/db');

const addQuiz = async (quizData) => {
    const { title, description, creator_id, is_public, category_id, image } = quizData;

    try {
        const query = `
          INSERT INTO quizzes (
            title, 
            description, 
            creator_id, 
            is_public, 
            category_id, 
            image,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        return new Promise((resolve, reject) => {
            db.query(query, [title, description, creator_id, is_public, category_id, image], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: result.insertId,
                        ...quizData,
                    });
                }
            });
        });
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Lỗi khi thêm quiz vào cơ sở dữ liệu: " + error.message);
    }
};
const getQuizzesByUserId = async (userId) => {
    try {
        const query = `
        SELECT * FROM quizzes
        WHERE creator_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.query(query, [userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Lỗi khi lấy danh sách quiz: " + error.message);
    }
};

const getQuestionsWithAnswers = async () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT q.question_id, q.question_text, q.question_type, a.answer_id, a.answer_text, a.is_correct
            FROM questions q
            LEFT JOIN answers a ON q.question_id = a.question_id
            ORDER BY q.question_id;
        `;
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                const questions = [];
                results.forEach(row => {
                    const question = questions.find(q => q.question_id === row.question_id);
                    if (!question) {
                        questions.push({
                            question_id: row.question_id,
                            question_text: row.question_text,
                            question_type: row.question_type,
                            answers: [{
                                answer_id: row.answer_id,
                                answer_text: row.answer_text,
                                is_correct: row.is_correct
                            }]
                        });
                    } else {
                        question.answers.push({
                            answer_id: row.answer_id,
                            answer_text: row.answer_text,
                            is_correct: row.is_correct
                        });
                    }
                });
                resolve(questions);
            }
        });
    });
};

const checkAnswer = async (questionId, answerId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT is_correct FROM answers WHERE question_id = ? AND answer_id = ?`;
        db.query(query, [questionId, answerId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 && results[0].is_correct);
            }
        });
    });
};

module.exports = {
    addQuiz,
    getQuizzesByUserId,
    getQuestionsWithAnswers,
    checkAnswer
};
