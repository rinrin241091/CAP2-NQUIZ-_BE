const db = require('../config/db');

const addQuestionWithAnswers = (quizId, questionTypeId, questionText, timeLimit, points, answers) => {
  return new Promise((resolve, reject) => {
    // 1. Thêm câu hỏi
    const questionQuery = `
      INSERT INTO questions (quiz_id, question_text, time_limit, points, question_type_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      questionQuery,
      [quizId, questionText, timeLimit || 60, points || 1, questionTypeId],
      (err, result) => {
        if (err) return reject(err);

        const questionId = result.insertId;

        // 2. Thêm các đáp án
        const answerQuery = `
          INSERT INTO answers (question_id, answer_text, is_correct)
          VALUES ?
        `;
        const answerValues = answers.map(ans => [questionId, ans.answer_text, ans.is_correct ? 1 : 0]);
        db.query(answerQuery, [answerValues], (err2) => {
          if (err2) return reject(err2);
          resolve();
        });
      }
    );
  });
};

module.exports = { addQuestionWithAnswers }; 