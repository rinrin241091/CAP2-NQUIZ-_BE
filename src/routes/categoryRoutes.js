const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, categoryController.getCategoriesByUser);
// POST /categories

module.exports = router;
