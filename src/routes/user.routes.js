const express = require("express");
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = express.Router();

// Public routes
router.post("/register", UserController.registerUser);
router.post("/login", UserController.login);

// Password reset routes
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-otp", UserController.verifyOTP);
router.post("/reset-password", UserController.resetPassword);

// Profile routes
router.get("/profile", authMiddleware, UserController.getUserProfile);
router.put("/profile", authMiddleware, UserController.updateUserProfile);

// Admin routes
router.get("/admin/all", UserController.getAllUsers);
router.get("/admin/search/:username", UserController.searchUserByUserName);
router.post("/admin/add", UserController.createUser);
router.put("/admin/update/:id", UserController.updateUser);
router.delete("/admin/delete/:id", UserController.deleteUser);

module.exports = router;
