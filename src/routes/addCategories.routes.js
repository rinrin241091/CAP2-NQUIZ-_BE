const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/addCategories.controller");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, categoryController.createCategory);

module.exports = router;
