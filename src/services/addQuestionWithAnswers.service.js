const db = require('../config/db');

const addQuestionWithAnswers = (quizId, questionTypeId, questionText, timeLimit, points, answers) => {
  return new Promise((resolve, reject) => {
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

const deleteQuestionById = async (questionId) => {
  const query = "DELETE FROM questions WHERE question_id = ?";
  return db.promise().execute(query, [questionId]);
};
const getQuestionById = async (id) => {
  const [questionRows] = await db.promise().query(
    'SELECT * FROM questions WHERE question_id = ?',
    [id]
  );
  if (questionRows.length === 0) return null;

  const question = questionRows[0];

  const [answerRows] = await db.promise().query(
    'SELECT * FROM answers WHERE question_id = ?',
    [id]
  );
  question.answers = answerRows;

  return question;
};

const updateQuestion = async (id, question_text, time_limit, question_type_id, answers) => {
  // 1. Cập nhật câu hỏi
  await db.promise().query(
    'UPDATE questions SET question_text = ?, time_limit = ?, question_type_id = ? WHERE question_id = ?',
    [question_text, time_limit, question_type_id, id]
  );

  // 2. Xóa đáp án cũ
  await db.promise().query('DELETE FROM answers WHERE question_id = ?', [id]);

  // 3. Thêm lại đáp án cho tất cả loại (kể cả short answer)
  if (Array.isArray(answers) && answers.length > 0) {
    const values = answers.map(ans => [id, ans.answer_text, ans.is_correct ? 1 : 0]);
    await db.promise().query(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ?',
      [values]
    );
  }
};


module.exports = {
  addQuestionWithAnswers,
  deleteQuestionById,
  getQuestionById,
  updateQuestion
};
