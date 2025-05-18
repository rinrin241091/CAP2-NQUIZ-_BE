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
