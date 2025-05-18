const db = require("../config/db");

const addCategory = (userId, categoryName, callback) => {
  const query = 'INSERT INTO categories (user_id, category_name) VALUES (?, ?)';

  db.query(query, [userId, categoryName], (err, result) => {
    callback(err, result);
  });
};

module.exports = { addCategory };
