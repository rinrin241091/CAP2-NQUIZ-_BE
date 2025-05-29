const db = require('../config/db');

exports.getAllQuizzes = async () => {
    const [rows] = await db.promise().query(`
      SELECT 
        q.quiz_id,
        q.title,
        q.description,
        q.is_public,
        q.created_at,
        q.updated_at,
        q.category_id,
        q.image,
        u.username AS creator_username
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
    `);
    return rows;
  };
  

exports.createQuiz = async (data) => {
  const { title, description, creator_id, is_public, category_id, image } = data;
  const [result] = await db.promise().query(
    'INSERT INTO quizzes (title, description, creator_id, is_public, category_id, image) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, creator_id, is_public, category_id, image]
  );
  return { id: result.insertId };
};

exports.updateQuiz = async (id, data) => {
  const { title, description, is_public, category_id, image } = data;
  await db.promise().query(
    'UPDATE quizzes SET title=?, description=?, is_public=?, category_id=?, image=? WHERE quiz_id=?',
    [title, description, is_public, category_id, image, id]
  );
};

exports.deleteQuiz = async (id) => {
  await db.promise().query('DELETE FROM quizzes WHERE quiz_id=?', [id]);
};
