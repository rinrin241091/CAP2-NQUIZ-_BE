const db = require('../config/db');

exports.getAllQuestions = async () => {
  const [rows] = await db.promise().query('SELECT * FROM questions');
  return rows;
};

exports.createQuestion = async (data) => {
  const { quiz_id, question_text, time_limit, points, question_type_id } = data;
  const [result] = await db.promise().query(
    'INSERT INTO questions (quiz_id, question_text, time_limit, points, question_type_id) VALUES (?, ?, ?, ?, ?)',
    [quiz_id, question_text, time_limit || 60, points || 1, question_type_id]
  );
  return { id: result.insertId };
};

exports.updateQuestion = async (id, data) => {
  const { question_text, time_limit, points, question_type_id } = data;
  await db.promise().query(
    'UPDATE questions SET question_text=?, time_limit=?, points=?, question_type_id=? WHERE question_id=?',
    [question_text, time_limit, points, question_type_id, id]
  );
};

exports.deleteQuestion = async (id) => {
  await db.promise().query('DELETE FROM questions WHERE question_id=?', [id]);
};
