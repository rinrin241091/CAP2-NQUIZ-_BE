const express = require("express");
const router = express.Router();
const { explainQuestion } = require("../controllers/ai.controller");

router.post("/explain", explainQuestion);

module.exports = router;
