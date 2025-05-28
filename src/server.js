const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/db');
const app = require('./app');
const fuzz = require('fuzzball');
require('dotenv').config();

const port = process.env.PORT || 3000;
const rooms = {};

function convertVietnameseWordsToNumber(str) {
  const rawMap = {
    "một": "1", "hai": "2", "ba": "3", "bốn": "4", "tư": "4", "năm": "5",
    "sáu": "6", "bảy": "7", "tám": "8", "chín": "9", "không": "0"
  };

  // Normalize keys of the map (remove dấu)
  const map = {};
  for (let key in rawMap) {
    const normalizedKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    map[normalizedKey] = rawMap[key];
  }

  const normalizedInput = str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/); // split by space

  const result = normalizedInput.map(word => map[word] || "").join("");

  console.log("🧪 Normalize debug:", { input: str, output: result });
  return result;
}



const generateRoomId = () => {
  let roomId;
  do {
    roomId = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[roomId]);
  return roomId;
};

async function assertDatabaseConnectionOk() {
  return new Promise((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        console.error("❌ Không thể kết nối đến cơ sở dữ liệu:", err.message);
        reject(new Error("DB connection failed"));
      } else {
        console.log("✅ Kết nối cơ sở dữ liệu OK!");
        resolve();
      }
    });
  });
}

async function init() {
  try {
    await assertDatabaseConnectionOk();
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: "https://cap2-nquiz-fe.onrender.com",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("🟢 Người dùng đã kết nối:", socket.id);

      socket.on('createRoom', (name, quizId, questions) => {
        console.log("🟢 createRoom được gọi:", { name, quizId });
        console.log("🧾 Số lượng câu hỏi FE truyền:", questions?.length);
        console.log("🔍 Câu hỏi đầu tiên:", questions?.[0]);

        const roomId = generateRoomId();
        socket.join(roomId);

        rooms[roomId] = {
          players: [{ id: socket.id, name, score: 0, status: 'waiting' }],
          questions,
          currentQuestion: null,
          correctAnswer: null,
          correctAnswers: [],
          correctText: null,
          questionTimeout: null,
          answersReceived: 0,
          playerAnswers: [],
          askedQuestions: [],
          quizId,
        };

        socket.emit('roomCreated', roomId);
        console.log(`🧩 Phòng ${roomId} được tạo bởi ${name}`);
      });

      socket.on("joinRoom", (roomId, name) => {
        const room = rooms[roomId];
        if (!room) {
          socket.emit('roomJoined', { success: false, message: 'Phòng không tồn tại!' });
          return;
        }

        if (room.players.length >= 10) {
          socket.emit("roomJoined", {
            success: false,
            message: "Phòng đã đầy, không thể tham gia.",
          });
          return;
        }

        socket.join(roomId);

        // ✅ Check nếu người chơi đã tồn tại (theo tên hoặc theo socket.id)
        const alreadyExists = room.players.some(
          (p) => p.id === socket.id || p.name === name
        );

        if (!alreadyExists) {
          const status = room.currentQuestion ? 'playing' : 'waiting';
          room.players.push({ id: socket.id, name, score: 0, status });
        }

        io.to(roomId).emit('updatePlayers', room.players);
        socket.emit('roomJoined', { success: true, roomId, message: `${name} đã tham gia!` });
      });


      socket.on("startGame", (roomId) => {
        const roomData = rooms[roomId];
        if (!roomData) return;

        roomData.players.forEach(player => {
          player.status = 'playing';
        });

        io.to(roomId).emit('gameStarted', roomData.players);
        askNewQuestion(roomId);
      });
      
      socket.on("kickPlayer", (roomId, socketIdToKick) => {
        const room = rooms[roomId];
        if (!room) return;

        // Xóa người chơi khỏi danh sách
        room.players = room.players.filter((p) => p.id !== socketIdToKick);

        // Gửi thông báo kick
        io.to(socketIdToKick).emit("kicked");
        io.to(roomId).emit("updatePlayers", room.players);
      });

      socket.on("submitAnswer", (roomId, answerIndex, timeTaken) => {
        const room = rooms[roomId];
        if (!room || !room.currentQuestion) return;
        if (!room.playerAnswers.find(a => a.id === socket.id)) {
          room.playerAnswers.push({ id: socket.id, answerIndex, timeTaken });
          room.answersReceived++;
          if (room.answersReceived === room.players.length) {
            clearTimeout(room.questionTimeout);
            finishQuestion(roomId);
          }
        }
      });

      socket.on("submitMultipleAnswers", (roomId, answerIndices, timeTaken) => {
        const room = rooms[roomId];
        if (!room || !room.currentQuestion) return;
        if (!room.playerAnswers.find(a => a.id === socket.id)) {
          room.playerAnswers.push({ id: socket.id, answerIndices, timeTaken });
          room.answersReceived++;
          if (room.answersReceived === room.players.length) {
            clearTimeout(room.questionTimeout);
            finishQuestion(roomId);
          }
        }
      });

      socket.on("submitShortAnswer", (roomId, answerText, timeTaken) => {
        const room = rooms[roomId];
        if (!room || !room.currentQuestion) return;
        if (!room.playerAnswers.find(a => a.id === socket.id)) {
          room.playerAnswers.push({ id: socket.id, answerText, timeTaken });
          room.answersReceived++;
          if (room.answersReceived === room.players.length) {
            clearTimeout(room.questionTimeout);
            finishQuestion(roomId);
          }
        }
      });

      socket.on("pauseGame", (roomId) => {
        const room = rooms[roomId];
        if (room) {
          room.isPaused = true;
          clearTimeout(room.questionTimeout);
          io.to(roomId).emit("gamePaused");
        }
      });

      socket.on("resumeGame", (roomId) => {
        const room = rooms[roomId];
        if (room && room.isPaused) {
          room.isPaused = false;
          io.to(roomId).emit("gameResumed");
          const elapsed = Date.now() - room.questionStartTime;
          const remaining = Math.max(10 - Math.floor(elapsed / 1000), 0);
          if (remaining > 0) {
            room.questionTimeout = setTimeout(() => finishQuestion(roomId), remaining * 1000);
          } else {
            finishQuestion(roomId);
          }
        }
      });

      socket.on("getPlayers", (roomId) => {
        if (rooms[roomId]) {
          socket.emit("updatePlayers", rooms[roomId].players);
        }
      });
      socket.on("requestCurrentQuestion", (roomId) => {
        const room = rooms[roomId];
        if (!room || !room.currentQuestion) return;

        const formattedAnswers = room.currentQuestion.answers.map((a) => ({
          text: a.text,
          correct: !!a.correct,
        }));

        socket.emit("newQuestion", {
          question: room.currentQuestion.question_text,
          answers: formattedAnswers,
          question_type: room.currentQuestion.question_type,
          time_limit: room.currentQuestion.time_limit || 10,
        });
      });

      socket.on("disconnect", () => {
        for (const roomId in rooms) {
          rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
        }
        console.log("🔴 Người dùng đã ngắt kết nối:", socket.id);
      });
    });

function askNewQuestion(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const allQuestions = room.questions || [];
  const unasked = allQuestions.filter((_, i) => !room.askedQuestions.includes(i));

  if (unasked.length === 0 || allQuestions.length === 0) {
    const winner = room.players.length
      ? room.players.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
      : { name: "No one", score: 0 };

    const finalScores = room.players.map(p => ({ name: p.name, score: p.score }));
    io.to(roomId).emit("gameOver", { winner: winner.name, scores: finalScores });
    delete rooms[roomId];
    return;
  }

  const index = Math.floor(Math.random() * unasked.length);
  const question = unasked[index];
  const realIndex = allQuestions.indexOf(question);
  room.askedQuestions.push(realIndex);

  // 🛡️ Kiểm tra dữ liệu câu hỏi trước khi dùng
  if (!question || !question.answers || !Array.isArray(question.answers)) {
    console.error("❌ Invalid question format:", question);
    askNewQuestion(roomId); // Bỏ qua câu hỏi lỗi và hỏi câu khác
    return;
  }

  room.currentQuestion = question;
  room.questionStartTime = Date.now();
  room.answersReceived = 0;
  room.playerAnswers = [];

  const correctIndex = question.answers.findIndex((a) => a.correct);
  const correctIndices = question.answers.map((a, i) => a.correct ? i : null).filter(i => i !== null);
  const correctText = question.answers.find(a => a.correct)?.text?.toLowerCase().trim();

  room.correctAnswer = correctIndex;
  room.correctAnswers = correctIndices;
  room.correctText = correctText;

  const formattedAnswers = question.answers.map((a) => ({
    text: a.text,
    correct: !!a.correct,
  }));

  io.to(roomId).emit("newQuestion", {
    quizId: room.quizId,
    question: question.question_text,
    answers: formattedAnswers,
    question_type: question.question_type,
    time_limit: question.time_limit || 10,
  });

  room.questionTimeout = setTimeout(() => finishQuestion(roomId), (question.time_limit || 10) * 1000);
}

function finishQuestion(roomId) {
  const room = rooms[roomId];
  if (!room || !room.currentQuestion) return;

  const { question_type, time_limit = 10 } = room.currentQuestion;
  const players = room.players;

  // 👉 Hàm tính điểm theo thời gian
  const calculateScore = (timeTaken) => {
    return Math.round(Math.max(((time_limit - timeTaken) / time_limit) * 10, 1) * 100) / 100;
  };

  if (question_type === "Single Choice") {
    room.playerAnswers
      .filter(a => a.answerIndex === room.correctAnswer)
      .sort((a, b) => a.timeTaken - b.timeTaken)
      .forEach(a => {
        const player = players.find(p => p.id === a.id);
        if (player) player.score += calculateScore(a.timeTaken);
      });

    io.to(roomId).emit("answerResult", {
      correctAnswer: room.correctAnswer,
      scores: players.map(p => ({ name: p.name, score: p.score })),
    });
  }

  else if (question_type === "Multiple Choice") {
    room.playerAnswers.forEach(a => {
      const correct = room.correctAnswers;
      const selected = a.answerIndices;
      const isCorrect = selected.length === correct.length && selected.every(i => correct.includes(i));
      if (isCorrect) {
        const player = players.find(p => p.id === a.id);
        if (player) player.score += calculateScore(a.timeTaken);
      }
    });

    io.to(roomId).emit("answerResult", {
      correctAnswers: room.correctAnswers,
      scores: players.map(p => ({ name: p.name, score: p.score })),
    });
  }

  else if (question_type === "Short Answer") {
    room.playerAnswers.forEach((a) => {
      const userAnswer = a.answerText?.toLowerCase().trim();
      const normalizedUser = convertVietnameseWordsToNumber(userAnswer) || userAnswer;

      const correctText = room.correctText?.toLowerCase().trim();
      const normalizedCorrect = isNaN(correctText)
        ? convertVietnameseWordsToNumber(correctText) || correctText
        : correctText;

      const similarity = fuzz.ratio(normalizedUser, normalizedCorrect);

      console.log("🧪 So sánh:", {
        userAnswer,
        normalizedUser,
        correctText: room.correctText,
        normalizedCorrect,
        similarity
      });

      const isCorrect = similarity >= 85;
      if (isCorrect) {
        const player = players.find((p) => p.id === a.id);
        if (player) player.score += calculateScore(a.timeTaken);
      }
    });

    io.to(roomId).emit("answerResult", {
      correctAnswer: room.correctText,
      scores: players.map((p) => ({ name: p.name, score: p.score })),
    });
  }

  // Gửi câu hỏi tiếp theo sau 1.5 giây
  setTimeout(() => askNewQuestion(roomId), 1500);
}


    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Lỗi khởi động:", err.message);
    process.exit(1);
  }
}

init();
