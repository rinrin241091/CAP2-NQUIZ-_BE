const { validationResult } = require("express-validator");
const userServices = require("../services/user.service");
const db = require("../config/db");

const sendOtpRegister = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email là bắt buộc" });

    // ✅ Không kiểm tra email tồn tại ở đây (vì là đăng ký)
    const result = await userServices.sendOtpRegister(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in sendOtpRegister controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  console.log("Received body:", req.body);
  const { username, email, password, otp } = req.body;

  try {
    await userServices.verifyOTP(email, otp);

    // ✅ Kiểm tra email đã được dùng chưa
    const [existing] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const result = await userServices.register({ username, email, password });

    // Xoá OTP sau đăng ký thành công
    await db.promise().query("DELETE FROM otp WHERE email = ?", [email]);

    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: result.insertId });
  } catch (error) {
    console.error("🔥 Register Error:", error);
    res.status(400).json({
      message: error.message || "Đã xảy ra lỗi khi đăng ký người dùng",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await userServices.login({ email, password });

    // Trả về kết quả từ service, bao gồm token và thông tin người dùng
    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Controller login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const result = await userServices.forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email và OTP là bắt buộc" });
    }

    const result = await userServices.verifyOTP(email, otp);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyOTP controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP và mật khẩu mới là bắt buộc" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const result = await userServices.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in resetPassword controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    const user = await userServices.getUserProfile(token);

    res.status(200).json({
      username: user.username,
      email: user.email,
      password: "********",
    });
  } catch (error) {
    console.error("Error in getUserProfile controller:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message;

    res.status(500).json({ message: errorMessage });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    const { username, password } = req.body;

    const updatedUser = await userServices.updateUserProfile(token, {
      username,
      password,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Error in updateUserProfile controller:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message;

    res.status(500).json({ message: errorMessage });
  }
};

// Admin User Management Controllers
const getAllUsers = async (req, res) => {
  try {
    const users = await userServices.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const searchUserByUserName = async (req, res) => {
  try {
    const { username } = req.params;
    const users = await userServices.searchUserByUserName(username);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No matching users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUserByUserName controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  // Kiểm tra dữ liệu đầu vào
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role } = req.body;

    // Gọi đến service để tạo user
    const result = await userServices.createUser({
      username,
      email,
      password,
      role,
    });

    // Trả về kết quả nếu thành công
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error in createUser controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    console.log("🔧 UPDATE REQUEST:", { id, username, email, role });
    const user = await userServices.updateUser(id, {
      username,
      email,
      role,
      password,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userServices.deleteUser(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
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
  updateUserProfile,
  sendOtpRegister,
};
