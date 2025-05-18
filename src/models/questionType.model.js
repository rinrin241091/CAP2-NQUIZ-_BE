const db = require('../config/db');

const getAllQuestionTypes = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM question_type';
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { getAllQuestionTypes };
