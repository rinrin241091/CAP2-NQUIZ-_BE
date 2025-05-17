const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const db = require('./config/db');
const port = process.env.PORT || 3000;
const app = require('./app');
require('dotenv').config();


const rooms = {};

const generateRoomId = () => {
  let roomId;
  do {
    roomId = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[roomId]);
  return roomId;
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

    

    io.on("connection", (socket) => {
      console.log("Một người dùng đã kết nối");

      // Sự kiện tạo phòng mới
    socket.on('createRoom', (name, quizId) => {
      const roomId = generateRoomId();
      socket.join(roomId);
      io.to(roomId).emit("message", `${name} đã tạo phòng thành công! Phòng ID: ${roomId}`);

      rooms[roomId] = {
        players: [{ id: socket.id, name, score: 0, status: 'waiting' }],
        currentQuestion: null,
        correctAnswer: null,
        questionTimeout: null,
        answersReceived: 0,
        playerAnswers: [],
        askedQuestions: [],
        quizId: quizId, // ✅ thêm dòng này
      };

      socket.emit('roomCreated', roomId);
      console.log("Danh sách người chơi: ", rooms[roomId].players);
      console.log(`Phòng đã được tạo với ID: ${roomId}`);
    });


    socket.on("joinRoom", (roomId, name) => {
      if (!rooms[roomId]) {
        socket.emit('roomJoined', { success: false, message: 'Phòng không tồn tại!' });
        return;
      }

      socket.join(roomId); // Người chơi tham gia phòng
      const roomData = rooms[roomId];

      // Nếu game đã chạy (có câu hỏi đang hiện hành) thì đăng ký ngay với trạng thái 'playing'
      if (roomData.currentQuestion) {
        roomData.players.push({ id: socket.id, name, score: 0, status: 'playing' });
      } else {
        roomData.players.push({ id: socket.id, name, score: 0, status: 'waiting' });
      }

      io.to(roomId).emit('updatePlayers', roomData.players);
      socket.emit('roomJoined', { success: true, roomId, message: `${name} đã tham gia phòng!` });

      if (roomData.currentQuestion) {
        // Delay 100ms để đảm bảo client đã đăng ký sự kiện "currentQuestion"
        setTimeout(() => {
          const question = roomData.currentQuestion;
          // Tính thời gian còn lại (giả sử mỗi câu có 10 giây)
          const elapsed = Date.now() - roomData.questionStartTime;
          const remainingTime = Math.max(10 - Math.floor(elapsed / 1000), 0);
          const formattedAnswers = question.answers.map((a) => ({
            text: a.text,
            correct: a.correct === true
          }));
          socket.emit("currentQuestion", {
            question: question.question_text,
            answers: formattedAnswers,
            timer: remainingTime,
          });
        }, 100);
      }
    });

    // Khi game bắt đầu, cập nhật trạng thái của tất cả người chơi
    socket.on("startGame", (roomId) => {
      const roomData = rooms[roomId];
      if (!roomData) return;

      // Đổi trạng thái của tất cả người chơi thành 'playing'
      roomData.players.forEach(player => {
        player.status = 'playing';
      });

      io.to(roomId).emit('gameStarted', roomData.players);
      askNewQuestion(roomId);
    });


            // Khi client yêu cầu lấy danh sách người chơi của 1 phòng
      socket.on("getPlayers", (roomId) => {
        if (rooms[roomId]) {
          socket.emit("updatePlayers", rooms[roomId].players);
        }
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

      socket.on("pauseGame", (roomId) => {
        const roomData = rooms[roomId];
        if (roomData) {
          roomData.isPaused = true;
          clearTimeout(roomData.questionTimeout); // dừng timeout đang chạy
          io.to(roomId).emit("gamePaused");
        }
      });

      socket.on("resumeGame", (roomId) => {
        const roomData = rooms[roomId];
        if (roomData && roomData.isPaused) {
          roomData.isPaused = false;
          io.to(roomId).emit("gameResumed");
          // Nếu cần, thiết lập lại questionTimeout hoặc xử lý phần tiếp tục câu hỏi
          // Ví dụ: 
          const elapsed = Date.now() - roomData.questionStartTime;
          const remainingTime = Math.max(10 - Math.floor(elapsed / 1000), 0);
          // Nếu câu hỏi chưa hết thời gian, bạn có thể tiếp tục timeout:
          if (remainingTime > 0) {
            roomData.questionTimeout = setTimeout(() => {
              finishQuestion(roomId);
            }, remainingTime * 1000);
          } else {
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
    
      const quizId = rooms[roomId].quizId;
    
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
    
              const finalScores = rooms[roomId].players.map(player => ({
                name: player.name,
                score: player.score,
              }));
    
              io.to(roomId).emit("gameOver", { 
                winner: winner.name,
                scores: finalScores,
              });
    
              delete rooms[roomId];  // Xóa phòng sau khi kết thúc
              return;
            }
    
            const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
            const question = unaskedQuestions[randomIndex];
    
            // Lưu câu hỏi đã hỏi vào phòng để không bị hỏi lại
            const actualIndex = availableQuestions.indexOf(question);
            rooms[roomId].askedQuestions.push(actualIndex);
    
            rooms[roomId].currentQuestion = question;
            // Lưu lại thời điểm bắt đầu câu hỏi
            rooms[roomId].questionStartTime = Date.now();
    
            const correctAnswerIndex = question.answers.findIndex((ans) => ans.correct);
            rooms[roomId].correctAnswer = correctAnswerIndex;
            rooms[roomId].answersReceived = 0;
            rooms[roomId].playerAnswers = [];
    
            const formattedAnswers = question.answers.map((a) => ({
              text: a.text,
              correct: a.correct === true  
            }));
    
            io.to(roomId).emit("newQuestion", {
              question: question.question_text,
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
      if (!rooms[room]) return;
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
      }, 1500);
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
