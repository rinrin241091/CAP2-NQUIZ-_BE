const db = require("../config/db");

// Tổng số user
const getTotalUsers = async () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT COUNT(*) AS totalUsers FROM users;`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// Tổng số bài quiz
const getTotalQuizzes = async () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT COUNT(*) AS totalQuizzes FROM quizzes;`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// Tổng lượt chơi
const getTotalPlay = async () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(play_count) AS totalPlays FROM quizzes;`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// Biểu đồ hiệu suất (theo ngày, định dạng dd-mm-yyyy)
const getPerformanceChartData = async (range) => {
  return new Promise((resolve, reject) => {
    let dateCondition = "";

    if (range === "7days") {
      dateCondition = "WHERE created_at >= CURDATE() - INTERVAL 7 DAY";
    } else if (range === "30days") {
      dateCondition = "WHERE created_at >= CURDATE() - INTERVAL 30 DAY";
    } else if (range === "3months") {
      dateCondition = "WHERE created_at >= CURDATE() - INTERVAL 3 MONTH";
    }

    const query = `
      SELECT DATE_FORMAT(date_raw, '%d-%m-%Y') AS date, 
             SUM(total_users) AS totalUsers,
             SUM(total_quizzes) AS totalQuizzes,
             SUM(total_plays) AS totalPlays
      FROM (
        SELECT DATE(created_at) AS date_raw, COUNT(*) AS total_users, 0 AS total_quizzes, 0 AS total_plays
        FROM users
        ${dateCondition}
        GROUP BY DATE(created_at)

        UNION ALL

        SELECT DATE(created_at) AS date_raw, 0 AS total_users, COUNT(*) AS total_quizzes, 0 AS total_plays
        FROM quizzes
        ${dateCondition}
        GROUP BY DATE(created_at)

        UNION ALL

        SELECT DATE(created_at) AS date_raw, 0 AS total_users, 0 AS total_quizzes, IFNULL(SUM(play_count), 0) AS total_plays
        FROM quizzes
        ${dateCondition}
        GROUP BY DATE(created_at)
      ) AS combined
      GROUP BY date_raw
      ORDER BY date_raw ASC;
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("SQL error:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = {
  getTotalUsers,
  getTotalQuizzes,
  getTotalPlay,
  getPerformanceChartData,
};
