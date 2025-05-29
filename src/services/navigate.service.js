const db = require('../config/db');

const getAllQuizzesMath = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id = 3
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllQuizzesLiterature = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id = 4
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllQuizzesHistory = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id = 5
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllQuizzesGeography = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id = 6
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllQuizzesPhysics = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id =8
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
const getAllQuizzesChemistry = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT q.*, u.username AS users
      FROM quizzes q
      LEFT JOIN users u ON q.creator_id = u.user_id
      WHERE q.category_id = 9
      ORDER BY q.play_count DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
    getAllQuizzesMath,
    getAllQuizzesLiterature,
    getAllQuizzesHistory,
    getAllQuizzesGeography,
    getAllQuizzesPhysics,
    getAllQuizzesChemistry
};
