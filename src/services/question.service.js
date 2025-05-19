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
          q.question_type,
          q.time_limit,
          q.points,
          a.answer_id,
          a.answer_text,
          a.is_correct
      FROM 
          questions q
      LEFT JOIN 
          answers a ON q.question_id = a.question_id
      WHERE 
          q.quiz_id = ?
      ORDER BY q.question_id, a.answer_id;  -- Sắp xếp để hiển thị tất cả đáp án của câu hỏi
    `;
    
    // Truy vấn cơ sở dữ liệu và trả về kết quả
    const [questions] = await db.promise().query(query, [quizId]);
    console.log("Questions and answers fetched:", questions); // Debugging log

    // Nhóm câu hỏi và các đáp án của chúng
    const groupedQuestions = groupQuestionsWithAnswers(questions);

    // Trả về câu hỏi và đáp án theo định dạng mong muốn
    return groupedQuestions;
  } catch (error) {
    throw new Error("Error getting quiz questions and answers: " + error.message);
  }
};

// Hàm nhóm câu hỏi và đáp án
const groupQuestionsWithAnswers = (questions) => {
  const result = [];

  // Lặp qua các câu hỏi
  questions.forEach((question) => {
    const existingQuestion = result.find((q) => q.question_id === question.question_id);

    // Nếu câu hỏi đã có trong danh sách, thêm đáp án vào
    if (existingQuestion) {
      existingQuestion.answers.push({
        text: question.answer_text,
        correct: question.is_correct === 1, // Chuyển đổi is_correct từ 1/0 thành true/false
      });
    } else {
      // Nếu chưa có, tạo mới câu hỏi và đáp án của nó
      result.push({
        question_id: question.question_id,
        question_text: question.question_text,
        answers: [
          {
            text: question.answer_text,
            correct: question.is_correct === 1, // Chuyển đổi is_correct từ 1/0 thành true/false
          },
        ],
      });
    }
  });

  return result;
};

const incrementPlayCount = async (quizId) => {
  try {
    const query = `
      UPDATE Quizzes
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
