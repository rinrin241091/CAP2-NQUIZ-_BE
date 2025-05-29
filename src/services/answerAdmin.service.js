const db = require('../config/db');

exports.getAllAnswers = async () => {
  const [rows] = await db.promise().query('SELECT * FROM answers');
  return rows;
};

exports.createAnswer = async (data) => {
  const { question_id, answer_text, is_correct } = data;
  const [result] = await db.promise().query(
    'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
    [question_id, answer_text, is_correct ? 1 : 0]
  );
  return { id: result.insertId };
};

exports.updateAnswer = async (id, data) => {
  const { answer_text, is_correct } = data;
  await db.promise().query(
    'UPDATE answers SET answer_text=?, is_correct=? WHERE answer_id=?',
    [answer_text, is_correct ? 1 : 0, id]
  );
};

exports.deleteAnswer = async (id) => {
  await db.promise().query('DELETE FROM answers WHERE answer_id=?', [id]);
};
