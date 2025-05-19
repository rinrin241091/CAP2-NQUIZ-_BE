const db = require("../config/db");

const gameService = {
  // ✅ Tạo người tham gia (participant)
  async createParticipant(sessionId, userId) {
    const [result] = await db.promise().query(
      `INSERT INTO gameparticipants (session_id, user_id, score)
       VALUES (?, ?, 0)`,
      [sessionId, userId]
    );
    return result.insertId;
  },

  // ✅ Ghi lại câu trả lời
  async recordResponse(participantId, questionId, answerId, isCorrect, responseTime) {
    await db.promise().query(
      `INSERT INTO userresponses (participant_id, question_id, answer_id, is_correct, response_time)
       VALUES (?, ?, ?, ?, ?)`,
      [participantId, questionId, answerId, isCorrect, responseTime]
    );
  },

  // ✅ Lưu báo cáo kết quả
  async saveReport(sessionId, participantId, totalScore, correctAnswers, incorrectAnswers) {
    await db.promise().query(
      `INSERT INTO reports (session_id, participant_id, total_score, correct_answers, incorrect_answers)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, participantId, totalScore, correctAnswers, incorrectAnswers]
    );
  },
};

module.exports = gameService;
