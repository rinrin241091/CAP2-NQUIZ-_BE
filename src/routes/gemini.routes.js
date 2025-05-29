const express = require("express");
const router = express.Router();
const { explainQuestion } = require("../controllers/gemini.controller");

router.post("/explain", explainQuestion);

module.exports = router;
