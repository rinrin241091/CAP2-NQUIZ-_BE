const db = require('../config/db');

// Lấy danh sách quiz user đã chơi
const getQuizzesHistory = async (userId) => {
  const query = `
    SELECT 
      q.quiz_id,
      q.title AS quiz_title,
      MAX(gs.start_time) AS play_time,
      q.image
    FROM gameparticipants gp
    JOIN gamesessions gs ON gp.session_id = gs.session_id
    JOIN quizzes q ON gs.quiz_id = q.quiz_id
    WHERE gp.user_id = ?
    GROUP BY q.quiz_id, q.title, q.image
    ORDER BY play_time DESC;
  `;
  const [results] = await db.promise().query(query, [userId]);
  return results;
};

// Lấy review mới nhất (1 lần chơi gần nhất)
const getQuizReview = async (quizId, userId) => {
  const query = `
    SELECT 
      q.question_id,
      q.question_text,
      qt.name AS question_type,
      q.time_limit,
      q.points,
      a.answer_id,
      a.answer_text,
      a.is_correct,
      ur.answer_id AS user_answer_id
    FROM questions q
    JOIN question_type qt ON q.question_type_id = qt.question_type_id
    JOIN answers a ON q.question_id = a.question_id
    LEFT JOIN userresponses ur ON ur.question_id = q.question_id
      AND ur.participant_id = (
        SELECT gp.participant_id 
        FROM gameparticipants gp
        JOIN gamesessions gs ON gs.session_id = gp.session_id
        WHERE gs.quiz_id = ? AND gp.user_id = ?
        ORDER BY gs.start_time DESC
        LIMIT 1
      )
    WHERE q.quiz_id = ?
    ORDER BY q.question_id, a.answer_id
  `;

  const [rows] = await db.promise().query(query, [quizId, userId, quizId]);

  const grouped = {};
  rows.forEach((row) => {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] = {
        question_id: row.question_id,
        question_text: row.question_text,
        question_type: row.question_type,
        time_limit: row.time_limit,
        points: row.points,
        user_answer_id: row.user_answer_id,
        answers: [],
      };
    }

    grouped[row.question_id].answers.push({
      answer_id: row.answer_id,
      text: row.answer_text,
      correct: !!row.is_correct,
    });
  });

  return Object.values(grouped);
};


// Lấy danh sách tất cả session user đã chơi quiz đó
const getQuizAttemptsByUserAndQuiz = async (userId, quizId) => {
  const query = `
    SELECT 
      gs.session_id,
      gs.start_time,
      gp.score
    FROM gameparticipants gp
    JOIN gamesessions gs ON gp.session_id = gs.session_id
    WHERE gp.user_id = ? AND gs.quiz_id = ?
    ORDER BY gs.start_time DESC;
  `;
  const [rows] = await db.promise().query(query, [userId, quizId]);
  return rows;
};

// Lấy review theo session_id
const getQuizReviewBySession = async (sessionId, userId) => {
   console.log("🧪 Fetching sessionId, userId:", sessionId, userId);

  const query = `
    SELECT 
      q.question_id,
      q.question_text,
      qt.name AS question_type,
      q.time_limit,
      q.points,
      a.answer_id,
      a.answer_text,
      a.is_correct,
      (
        SELECT ur.answer_id
        FROM userresponses ur
        WHERE ur.question_id = q.question_id
          AND ur.participant_id = (
            SELECT participant_id 
            FROM gameparticipants 
            WHERE session_id = ? AND user_id = ?
            LIMIT 1
          )
        LIMIT 1
      ) AS user_answer_id
    FROM questions q
    JOIN question_type qt ON q.question_type_id = qt.question_type_id
    JOIN answers a ON a.question_id = q.question_id
    WHERE q.quiz_id = (
      SELECT quiz_id FROM gamesessions WHERE session_id = ?
    )
    ORDER BY q.question_id, a.answer_id;
  `;

  const [rows] = await db.promise().query(query, [sessionId, userId, sessionId]);

  const grouped = {};
  rows.forEach((row) => {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] = {
        question_id: row.question_id,
        question_text: row.question_text,
        question_type: row.question_type,
        time_limit: row.time_limit,
        points: row.points,
        user_answer_id: row.user_answer_id,
        answers: [],
      };
    }

    const alreadyExists = grouped[row.question_id].answers.find(
      (a) => a.answer_id === row.answer_id
    );
    if (!alreadyExists) {
      grouped[row.question_id].answers.push({
        answer_id: row.answer_id,
        text: row.answer_text,
        correct: !!row.is_correct,
      });
    }
  });

  return Object.values(grouped);
};


module.exports = {
  getQuizzesHistory,
  getQuizReview,
  getQuizAttemptsByUserAndQuiz,
  getQuizReviewBySession
};
