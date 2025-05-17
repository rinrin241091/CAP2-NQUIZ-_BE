// 📁 services/quiz.service.js
const db = require('../config/db');

const getAllQuizzes = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM quizzes', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getQuizById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM quizzes WHERE quiz_id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};
const getRandomQuizzesEachDay = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT q.*, u.username AS users
       FROM quizzes q
       JOIN users u ON q.creator_id = u.user_id
       ORDER BY MD5(CONCAT(CURDATE(), q.quiz_id))
       LIMIT 6`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};
const getMostUsedQuizzes = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT q.*, u.username AS users
       FROM quizzes q
       LEFT JOIN users u ON q.creator_id = u.user_id
       ORDER BY q.play_count DESC
       LIMIT 6`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};
const getRecentlyPlayedQuizzes = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT q.*, u.username AS users
       FROM quizzes q
       LEFT JOIN users u ON q.creator_id = u.user_id
       WHERE q.last_played_at IS NOT NULL
       ORDER BY q.last_played_at DESC
       LIMIT 6`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  getRandomQuizzesEachDay,
  getMostUsedQuizzes,
  getRecentlyPlayedQuizzes,
};
