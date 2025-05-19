const multer = require('multer');

// Sử dụng bộ nhớ đệm (RAM) thay vì lưu vào ổ đĩa
const storage = multer.memoryStorage();

// Middleware multer với bộ nhớ tạm
const upload = multer({ storage: storage });

module.exports = upload;
