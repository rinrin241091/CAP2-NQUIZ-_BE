const db = require('../config/db');

const getQuestionsByQuizId = (quizId) => {
  return new Promise((resolve, reject) => {
    // Chỉ chọn cột question_text
    const query = 'SELECT question_text FROM questions WHERE quiz_id = ?';
    db.query(query, [quizId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Kết quả sẽ là một mảng các object dạng [{ question_text: '...' }, { question_text: '...' }, ...]
        resolve(results);
      }
    });
  });
};

module.exports = { getQuestionsByQuizId };
