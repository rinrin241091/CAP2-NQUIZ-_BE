const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/mail");
const { verifyToken, generateToken } = require("../utils/jwt");


const sendOtpRegister = async (email) => {
  try {
    // Tạo và lưu OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP hết hạn sau 5 phút

    // Xóa các OTP cũ nếu có
    await db.promise().query("DELETE FROM otp WHERE email = ?", [email]);

    // Lưu OTP mới
    await db.promise().query(
      "INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Gửi OTP
    await sendOTP(email, otp);

    return { message: "OTP đã được gửi đến email của bạn" };
  } catch (error) {
    throw new Error(error.message || "Lỗi gửi OTP");
  }
};

const register = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const values = [userData.username, userData.email, hashedPassword];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          console.error("❌ DB INSERT ERROR:", err); // 👈 log rõ lỗi SQL
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw new Error("Không thể tạo người dùng");
  }
};

const login = async (data) => {
  const { email, password } = data;

  try {
    const queryUser = "SELECT * FROM users WHERE email = ?";
    const [user] = await db.promise().query(queryUser, [email]);

    if (!user || user.length === 0) {
      throw new Error("Tên người dùng hoặc mật khẩu không chính xác");
    }

    const foundUser = user[0]; // Lấy người dùng đầu tiên từ kết quả query

    if (!password || !foundUser.password) {
      throw new Error("Mật khẩu không hợp lệ");
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      throw new Error("Tên người dùng hoặc mật khẩu không chính xác");
    }

    const payload = {
      user_id: foundUser.user_id,
      email: foundUser.email,
      role: foundUser.role
    };
    console.log("Generated Payload:", payload);
    const { accessToken, refreshToken } = await generateToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        user_id: foundUser.user_id, 
        email: foundUser.email,
        username: foundUser.username,
        avatar: foundUser.avatar,
        role: foundUser.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
  }
};

const generateOTP = () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  return otpCode;
};

const sendOTP = async (email, otp) => {
  const subject = "Đây là mã OTPcuar bạn.";
  const text = `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Đặt lại mật khẩu</h2>
      <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
      <p>Mã này có hiệu lực trong 5 phút.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, text, html);
    console.log("OTP đã được gửi thành công");
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    throw new Error("Không thể gửi OTP. Vui lòng thử lại sau.");
  }
};

const forgotPassword = async (email) => {
  try {
    // Kiểm tra email có tồn tại không
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || user.length === 0) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    // Tạo và lưu OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP hết hạn sau 5 phút

    // Xóa các OTP cũ của email này
    await db.promise().query("DELETE FROM otp WHERE email = ?", [email]);

    // Lưu OTP mới
    await db
      .promise()
      .query("INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, ?)", [
        email,
        otp,
        expiresAt,
      ]);

    // Gửi OTP qua email
    await sendOTP(email, otp);

    return { message: "OTP đã được gửi đến email của bạn" };
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyOTP = async (email, otp) => {
  try {
    // Kiểm tra OTP
    console.log("📥 verifyOTP input:", email, otp);

    const [otpRecord] = await db
      .promise()
      .query(
        "SELECT * FROM otp WHERE email = ? AND otp = ? AND expires_at > NOW()",
        [email, otp]
      );

    if (!otpRecord || otpRecord.length === 0) {
      throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }

    return { message: "OTP hợp lệ" };
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (email, otp, newPassword) => {
  try {
    // Kiểm tra OTP
    const [otpRecord] = await db
      .promise()
      .query(
        "SELECT * FROM otp WHERE email = ? AND otp = ? AND expires_at > NOW()",
        [email, otp]
      );

    if (!otpRecord || otpRecord.length === 0) {
      throw new Error("OTP không hợp lệ hoặc đã hết hạn");
    }

    // Mã OTP hợp lệ, tiếp tục cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Mã hóa mật khẩu mới
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    await db.promise().query(updatePasswordQuery, [hashedPassword, email]);

    // Xóa OTP sau khi sử dụng
    const deleteOTPQuery = "DELETE FROM otp WHERE email = ?";
    await db.promise().query(deleteOTPQuery, [email]);

    console.log('Mật khẩu đã được cập nhật thành công');
    return 'Mật khẩu đã được thay đổi thành công.';
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserProfile = async (token) => {
  try {
    // Xác thực token và giải mã
    const decoded = await verifyToken(token);
    console.log("Decoded: ", decoded);

    // Lấy email từ 'sub'
    const email = decoded.email;
    console.log("Decoded email: ", email);

    // Truy vấn DB với email từ JWT
    const query = "SELECT username, email FROM users WHERE email = ?";
    const [result] = await db.promise().query(query, [email]);

    if (result.length === 0) {
      throw new Error("User not found");
    }

    return result[0];
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (token, updateData) => {
  try {
    // Xác thực và giải mã token
    const decoded = await verifyToken(token);
    const email = decoded.email;
    console.log("Decoded email: ", email);

    const { username, password } = updateData;

    if (!username && !password) {
      throw new Error("No update data provided");
    }

    if (username && username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (password && password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Kiểm tra trùng username
    if (username) {
      const isUsernameExists = await checkUsernameExists(username, email);
      if (isUsernameExists) {
        throw new Error("Username already exists");
      }
    }

    let query = "UPDATE users SET";
    const values = [];

    if (username) {
      query += " username = ?,";
      values.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += " password = ?,";
      values.push(hashedPassword);
    }

    query = query.slice(0, -1); // Bỏ dấu ,
    query += " WHERE email = ?";
    values.push(email);

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      throw new Error("User not found or no change applied");
    }

    // Lấy lại thông tin người dùng sau khi cập nhật
    const [updatedUser] = await db
      .promise()
      .query("SELECT username, email FROM users WHERE email = ?", [email]);

    return updatedUser[0];
  } catch (error) {
    throw new Error(error.message || "Error updating user profile");
  }
};

// Admin User Management Services
const getAllUsers = async () => {
  try {
    const query = `
      SELECT 
        user_id,
        username, 
        email, 
        role, 
        DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at 
      FROM users
    `;
    const [users] = await db.promise().query(query);
    return users;
  } catch (error) {
    throw new Error("Error fetching users");
  }
};

const searchUserByUserName = async (username) => {
  try {
    const query = `
      SELECT user_id, username, email, role, DATE_FORMAT(created_at, '%d-%m-%Y') AS created_at
      FROM users
      WHERE username LIKE ?`;
    const [users] = await db.promise().query(query, [`%${username}%`]);
    return users;
  } catch (error) {
    throw new Error("Error searching user");
  }
};

const createUser = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      userData.username,
      userData.email,
      hashedPassword,
      userData.role || "user", // fallback nếu không có role
    ];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          console.error("Error inserting user:", err); // để dễ debug
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error("Error in register function:", error);
    throw new Error("Không thể tạo người dùng");
  }
};

const updateUser = async (id, userData) => {
  try {
    const { username, email, role, password } = userData;

    let query = "UPDATE users SET username = ?, email = ?, role = ?";
    const values = [username, email, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashedPassword);
    }

    query += " WHERE user_id = ?";
    values.push(id);

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return {
      user_id: id,
      username,
      email,
      role,
    };
  } catch (error) {
    throw new Error("Error updating user");
  }
};

const deleteUser = async (id) => {
  try {
    const query = "DELETE FROM users WHERE user_id = ?";
    const [result] = await db.promise().query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error("Error deleting user");
  }
};

const checkUsernameExists = async (username, excludeEmail = null) => {
  try {
    let query = "SELECT COUNT(*) as count FROM users WHERE username = ?";
    const values = [username];

    if (excludeEmail) {
      query += " AND email != ?";
      values.push(excludeEmail);
    }

    const [result] = await db.promise().query(query, values);
    return result[0].count > 0;
  } catch (error) {
    throw new Error("Error checking username");
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getUserProfile,
  getAllUsers,
  searchUserByUserName,
  createUser,
  updateUser,
  deleteUser,
  checkUsernameExists,
  updateUserProfile,
  sendOtpRegister
};
