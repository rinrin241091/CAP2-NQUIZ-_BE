const { validationResult } = require("express-validator");
const userServices = require("../services/user.service");

const registerUser = async (req, res) => {
  console.log("Processing registration request:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;

  try {
    const result = await userServices.register({ username, email, password });
    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: result.insertId });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng ký người dùng",
      error: error.message,
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
  const { email } = req.body;

  try {
    const message = await userServices.forgotPassword(email);
    res.status(200).json({ message });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTPAndUpdatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const message = await userServices.verifyOTPAndUpdatePassword(
      email,
      otp,
      newPassword
    );
    res.status(200).json({ message });
  } catch (error) {
    console.error(
      "Error in verifyOTPAndUpdatePassword controller:",
      error.message
    );
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ message: "Invalid user token" });
    }

    const userEmail = req.user.email;
    const user = await userServices.getUserProfile(userEmail);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      password: "********", // Ẩn mật khẩu
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
    if (!req.user || !req.user.email) {
      return res.status(400).json({ message: "Invalid user token" });
    }

    const { username, password } = req.body;
    const userEmail = req.user.email;

    // Validate input
    if (!username && !password) {
      return res.status(400).json({ message: "No update data provided" });
    }

    if (username && username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long" });
    }

    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const updatedUser = await userServices.updateUserProfile(userEmail, {
      username,
      password,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Error in updateUserProfile controller:", error);
    res.status(500).json({ message: error.message });
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
  verifyOTPAndUpdatePassword,
  getUserProfile,
  getAllUsers,
  searchUserByUserName,
  createUser,
  updateUser,
  deleteUser,
  updateUserProfile,
};
