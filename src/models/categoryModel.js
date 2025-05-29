const db = require("../config/db");

exports.findByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM categories WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.create = ({ category_name, user_id }) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO categories (category_name, user_id) VALUES (?, ?)";
    db.query(query, [category_name, user_id], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, category_name, user_id });
    });
  });
};

exports.deleteByIdAndUser = (categoryId, userId) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM categories WHERE category_id = ? AND user_id = ?";
    db.query(query, [categoryId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
