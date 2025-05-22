const db = require("../config/db");

const saveFullGame  = async ({ quizId, hostId, roomPin, players, responses }) => {
  const [sessionResult] = await db.promise().query(
    "INSERT INTO gamesessions (quiz_id, host_id, room_pin) VALUES (?, ?, ?)",
    [quizId, hostId, roomPin]
  );
  const sessionId = sessionResult.insertId;

  const participantMap = {};
  for (const player of players) {
    const [userRows] = await db.promise().query(
      "SELECT user_id FROM users WHERE username = ?",
      [player.name]
    );
    const userId = userRows[0]?.user_id;
    if (!userId) continue;

    const [participantResult] = await db.promise().query(
      "INSERT INTO gameparticipants (session_id, user_id, score) VALUES (?, ?, ?)",
      [sessionId, userId, player.score]
    );

    participantMap[player.name] = {
      userId,
      participantId: participantResult.insertId,
    };
  }

  for (const res of responses) {
    const player = participantMap[res.playerName];
    console.log("🧪 res.playerName =", res.playerName);
console.log("📌 participantMap =", participantMap);

    if (!player) continue;

    const [questionRows] = await db.promise().query(
      "SELECT question_id FROM questions WHERE question_text = ? AND quiz_id = ? LIMIT 1",
      [res.questionText, quizId]
    );
    const questionId = questionRows[0]?.question_id;

    if (!questionId) continue;

    let answerId = null;
    let isCorrect = 0;

    if (res.answerIndex !== undefined) {
      const [answerRows] = await db.promise().query(
        "SELECT answer_id, is_correct FROM answers WHERE question_id = ? LIMIT ?, 1",
        [questionId, res.answerIndex]
      );
      if (answerRows[0]) {
        answerId = answerRows[0].answer_id;
        isCorrect = answerRows[0].is_correct;
      }
    }

    if (answerId !== null) {
      await db.promise().query(
        "INSERT INTO userresponses (participant_id, question_id, answer_id, is_correct, response_time) VALUES (?, ?, ?, ?, ?)",
        [player.participantId, questionId, answerId, isCorrect, res.timeTaken || 0]
      );
    }
  }

  for (const { participantId } of Object.values(participantMap)) {
    const [correct] = await db.promise().query(
      "SELECT COUNT(*) as total FROM userresponses WHERE participant_id = ? AND is_correct = 1",
      [participantId]
    );
    const [incorrect] = await db.promise().query(
      "SELECT COUNT(*) as total FROM userresponses WHERE participant_id = ? AND is_correct = 0",
      [participantId]
    );
    const [scoreRow] = await db.promise().query(
      "SELECT score FROM gameparticipants WHERE participant_id = ?",
      [participantId]
    );

    await db.promise().query(
      "INSERT INTO reports (session_id, participant_id, total_score, correct_answers, incorrect_answers) VALUES (?, ?, ?, ?, ?)",
      [sessionId, participantId, scoreRow[0].score, correct[0].total, incorrect[0].total]
    );
  }

  return { success: true, sessionId };
};


module.exports = {
    saveFullGame
};