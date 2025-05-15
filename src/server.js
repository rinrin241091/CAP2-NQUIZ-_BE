const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const db = require('./config/db');
const port = process.env.PORT || 3000;
const app = require('./app');
require('dotenv').config();



const generateRoomId = () => {
  const generateRoomId = Math.floor(100000 + Math.random() * 900000).toString();
  return generateRoomId;
};
// Kiểm tra kết nối cơ sở dữ liệu
async function assertDatabaseConnectionOk() {
  return new Promise((resolve, reject) => {
    console.log("Đang kiểm tra kết nối cơ sở dữ liệu...");
    db.connect((err) => {
      if (err) {
        console.error("Không thể kết nối đến cơ sở dữ liệu:", err.message);
        reject(new Error("Không thể kết nối đến cơ sở dữ liệu"));
      } else {
        console.log("Kết nối cơ sở dữ liệu OK!");
        resolve();
      }
    });
  });
}

  // Khởi tạo server
  async function init() {
    try {
      await assertDatabaseConnectionOk();
      console.log(`Khởi động Express trên cổng ${port}...`);

      const server = http.createServer(app);
      const io = socketIo(server, {
        cors: {
          origin: "*",  // Cho phép tất cả các nguồn gốc
          // origin: "http://localhost:5173",  // Đảm bảo client của bạn truy cập đúng
          methods: ["GET", "POST"]
        }
      });

    
  const rooms = {};

  io.on("connection", (socket) => {
    console.log("Một người dùng đã kết nối");
  
    // Sự kiện tạo phòng mới
    socket.on('createRoom', (name) => {
      const roomId = generateRoomId();  // Tạo ID phòng duy nhất
      socket.join(roomId);  // Người tạo phòng tham gia phòng mới
      io.to(roomId).emit("message", `${name} đã tạo phòng thành công! Phòng ID: ${roomId}`);
  
      // Khởi tạo phòng trong đối tượng `rooms`
      rooms[roomId] = {
        players: [{ id: socket.id, name, score: 0, status: 'waiting' }], // Trạng thái 'waiting' nghĩa là người chơi đang trong phòng chờ
        currentQuestion: null,
        correctAnswer: null,
        questionTimeout: null,
        answersReceived: 0,
        playerAnswers: [],
        askedQuestions: [],
      };
  
      // Gửi lại ID phòng cho người tạo
      socket.emit('roomCreated', roomId);
      console.log("Danh sách người chơi: ", rooms[roomId].players); 
  
      console.log(`Phòng đã được tạo với ID: ${roomId}`);
    });
  
// Khi người tham gia phòng
    socket.on("joinRoom", (roomId, name) => {
      if (!rooms[roomId]) {
        socket.emit('roomJoined', { success: false, message: 'Phòng không tồn tại!' });
        return;
      }

      socket.join(roomId); // Người chơi tham gia phòng
      rooms[roomId].players.push({ id: socket.id, name, score: 0, status: 'waiting' });

      // Phát sóng sự kiện updatePlayers để cập nhật danh sách người chơi cho tất cả các client
      io.to(roomId).emit('updatePlayers', rooms[roomId].players);

      // Gửi thông báo và ID phòng cho người tham gia
      socket.emit('roomJoined', { success: true, roomId, message: `${name} đã tham gia phòng!` });
      if (rooms[roomId].currentQuestion) {
        const question = rooms[roomId].currentQuestion;
        io.to(socket.id).emit("newQuestion", {
          question: question.question,
          answers: question.answers.map((a) => a.text),
          timer: 10,
        });
      }
    });
// Khi client yêu cầu lấy danh sách người chơi của 1 phòng
    socket.on("getPlayers", (roomId) => {
      if (rooms[roomId]) {
        socket.emit("updatePlayers", rooms[roomId].players);
      }
    });


    // Khi người tạo phòng bắt đầu trò chơi
  socket.on('startGame', (roomId) => {
    const roomData = rooms[roomId];
    if (!roomData) return;

    // Đổi trạng thái của tất cả người chơi thành 'playing'
    roomData.players.forEach(player => {
      player.status = 'playing';
    });

    io.to(roomId).emit('gameStarted', roomData.players);
    askNewQuestion(roomId);
  });
  
    // Xử lý việc trả lời
    socket.on("submitAnswer", (roomId, answerIndex, timeTaken) => {
      const roomData = rooms[roomId];
      if (!roomData || !roomData.currentQuestion) return;
  
      if (!roomData.playerAnswers.find((ans) => ans.id === socket.id)) {
        roomData.playerAnswers.push({
          id: socket.id,
          answerIndex,
          timeTaken,
        });
  
        roomData.answersReceived++;
  
        if (roomData.answersReceived === roomData.players.length) {
          clearTimeout(roomData.questionTimeout);
          finishQuestion(roomId);
        }
      }
    });
  
    // Xử lý sự kiện ngắt kết nối
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        rooms[roomId].players = rooms[roomId].players.filter(
          (player) => player.id !== socket.id
        );
      }
      console.log("Một người dùng đã ngắt kết nối");
    });
  });

function askNewQuestion(roomId) {
  if (rooms[roomId].players.length === 0) {
    clearTimeout(rooms[roomId].questionTimeout);
    delete rooms[roomId];
    return;
  }

  const quizId = 6;  // Giả sử quizId là 6

  axios.get(`http://localhost:3000/question/quiz/${quizId}`)
    .then((response) => {
      if (response.data.success) {
        const availableQuestions = response.data.data;  // Lấy danh sách câu hỏi từ API

        // Lọc các câu hỏi chưa được hỏi
        const unaskedQuestions = availableQuestions.filter((_, index) => !rooms[roomId].askedQuestions.includes(index));

        if (unaskedQuestions.length === 0) {
          const winner = rooms[roomId].players.reduce((prev, curr) =>
            curr.score > prev.score ? curr : prev
          );
          io.to(roomId).emit("gameOver", { winner: winner.name });
          delete rooms[roomId];  // Xóa phòng sau khi kết thúc
          return;
        }

        const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
        const question = unaskedQuestions[randomIndex];

        // Lưu câu hỏi đã hỏi vào phòng để không bị hỏi lại
        const actualIndex = availableQuestions.indexOf(question);
        rooms[roomId].askedQuestions.push(actualIndex);

        rooms[roomId].currentQuestion = question;
        const correctAnswerIndex = question.answers.findIndex((ans) => ans.correct);
        rooms[roomId].correctAnswer = correctAnswerIndex;
        rooms[roomId].answersReceived = 0;
        rooms[roomId].playerAnswers = [];

        // Định dạng lại đáp án theo yêu cầu
        const formattedAnswers = question.answers.map((a) => ({
          text: a.text,
          correct: a.correct === true  // Kiểm tra điều kiện đúng
        }));

        io.to(roomId).emit("newQuestion", {
          question: question.question_text,  // Lấy câu hỏi từ API
          answers: formattedAnswers,
          timer: 10,
        });

        rooms[roomId].questionTimeout = setTimeout(() => {
          finishQuestion(roomId);
        }, 10000);

      } else {
        io.to(roomId).emit("message", "Không tìm thấy câu hỏi cho quiz này.");
      }
    })
    .catch((error) => {
      console.error("Error fetching questions from API:", error);
      io.to(roomId).emit("message", "Lỗi khi lấy câu hỏi từ API.");
    });
}




  function finishQuestion(room) {
    const correctIndex = rooms[room].correctAnswer;
    const playerAnswers = rooms[room].playerAnswers;

    // Chỉ cộng điểm cho những người trả lời đúng
    playerAnswers
      .filter((a) => a.answerIndex === correctIndex)
      .sort((a, b) => a.timeTaken - b.timeTaken)
      .forEach((ans) => {
        const player = rooms[room].players.find((p) => p.id === ans.id);
        if (player) {
          player.score += Math.max(10 - ans.timeTaken, 1); // Cộng điểm cho người trả lời đúng và nhanh
        }
      });

    // Không trừ điểm cho người trả lời sai nữa
    // playerAnswers
    //   .filter((a) => a.answerIndex !== correctIndex)
    //   .forEach((ans) => {
    //     const player = rooms[room].players.find((p) => p.id === ans.id);
    //     if (player) {
    //       player.score = Math.max(player.score - 1, 0); // Không còn phần này
    //     }
    //   });

    // Gửi kết quả câu trả lời và điểm số của mọi người
    io.to(room).emit("answerResult", {
      correctAnswer: correctIndex,
      scores: rooms[room].players.map((p) => ({
        name: p.name,
        score: p.score,
      })),
    });

    // Chuyển sang câu hỏi tiếp theo sau 1 giây
    setTimeout(() => {
      askNewQuestion(room);
    }, 1000);
  }

const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });


  } catch (error) {
    console.error("Lỗi khi khởi động ứng dụng:", error.message);
    process.exit(1);
  }
}

init();
