const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/db'); 
const port = process.env.PORT || 3000;
const app = express();
require("dotenv").config();

// Hàm trả về Promise cho việc kết nối cơ sở dữ liệu
function assertDatabaseConnectionOk() {
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

// Khởi động server
async function init() {
  try {
    await assertDatabaseConnectionOk(); 
    console.log(`Khởi động Express trên cổng ${port}...`);
    
    // Tạo server HTTP từ Express
    const server = http.createServer(app);
    
    // Tạo server Socket.IO và gắn vào server HTTP
    const io = socketIo(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    // Lắng nghe kết nối từ client
    io.on('connection', (socket) => {
      console.log('Một người dùng đã kết nối');

      // Lắng nghe sự kiện từ client
      socket.on('disconnect', () => {
        console.log('Người dùng đã ngắt kết nối');
      });
    });

    // Lắng nghe trên cổng
    server.listen(port, () => {
      console.log(`Server đang chạy tại http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Lỗi khi khởi động ứng dụng:", error.message);
    process.exit(1);  // Dừng ứng dụng khi có lỗi
  }
}

init();
