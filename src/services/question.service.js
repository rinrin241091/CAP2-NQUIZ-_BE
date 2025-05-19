const db = require("../config/db");

// Tạo quiz mới
const createQuiz = async (title, description, creator_id, is_public) => {
  try {
    const query = "INSERT INTO quizzes (title, description, creator_id, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
    const values = [title, description, creator_id, is_public];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw new Error("Không thể tạo quiz");
  }
};

// Tạo câu hỏi mới
const createQuestion = async (quiz_id, question_text, question_type, answers, true_false_answer) => {
  try {
    const queryQuiz = "SELECT quiz_id FROM quizzes WHERE quiz_id = ?";
    const [quizResult] = await db.promise().query(queryQuiz, [quiz_id]);

    if (!quizResult || quizResult.length === 0) {
      throw new Error("Quiz không tồn tại");
    }

    const insertQuestionQuery = "INSERT INTO questions (quiz_id, question_text, question_type, time_limit, points, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    const [questionResult] = await db.promise().query(insertQuestionQuery, [quiz_id, question_text, question_type, 60, 1]);

    const questionId = questionResult.insertId;

    if (question_type === 'multiple_choice' || question_type === 'checkboxes') {
      for (const answer of answers) {
        await db.promise().query(
          "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)",
          [questionId, answer.text, answer.isCorrect ? 1 : 0]
        );
      }
    } else if (question_type === 'true_false') {
      await db.promise().query(
        "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)",
        [questionId, 'True', true_false_answer === 'true' ? 1 : 0]
      );
      await db.promise().query(
        "INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)",
        [questionId, 'False', true_false_answer === 'false' ? 1 : 0]
      );
    }

    return { question_id: questionId };
  } catch (error) {
    throw new Error("Không thể tạo câu hỏi: " + error.message);
  }
};

// Lấy danh sách câu hỏi của một quiz
const getQuizQuestions = async (quizId) => {
  try {
    const query = `
      SELECT 
          q.question_id,
          q.quiz_id,
          q.question_text,
          qt.name AS question_type,  -- Lấy tên loại câu hỏi từ bảng question_type
          q.time_limit,
          q.points,
          a.answer_id,
          a.answer_text,
          a.is_correct
      FROM 
          questions q
      LEFT JOIN 
          answers a ON q.question_id = a.question_id
      LEFT JOIN 
          question_type qt ON q.question_type_id = qt.question_type_id
      WHERE 
          q.quiz_id = ?
      ORDER BY 
          q.question_id, a.answer_id;
    `;
    
    const [questions] = await db.promise().query(query, [quizId]);
    console.log("Questions and answers fetched:", questions);

    const groupedQuestions = groupQuestionsWithAnswers(questions);
    return groupedQuestions;
  } catch (error) {
    throw new Error("Error getting quiz questions and answers: " + error.message);
  }
};

const groupQuestionsWithAnswers = (questions) => {
  const result = [];

  questions.forEach((question) => {
    const existingQuestion = result.find((q) => q.question_id === question.question_id);

    if (existingQuestion) {
      existingQuestion.answers.push({
        text: question.answer_text,
        correct: question.is_correct === 1,
      });
    } else {
      result.push({
        question_id: question.question_id,
        question_text: question.question_text,
        question_type: question.question_type || "Unknown",
        time_limit: question.time_limit,
        points: question.points,
        answers: question.answer_text ? [{
          text: question.answer_text,
          correct: question.is_correct === 1,
        }] : [],
      });
    }
  });

  return result;
};


const incrementPlayCount = async (quizId) => {
  try {
    const query = `
      UPDATE quizzes
      SET 
        play_count = play_count + 1,
        last_played_at = CURRENT_TIMESTAMP
      WHERE quiz_id = ?;
    `;
    await db.promise().query(query, [quizId]);
  } catch (error) {
    throw new Error("Error incrementing play count: " + error.message);
  }
};



module.exports = {
  createQuiz,
  createQuestion,
  getQuizQuestions,
  incrementPlayCount,
};
