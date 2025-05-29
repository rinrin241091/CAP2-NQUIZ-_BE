const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post('/save-results', gameController.saveGameResults);

module.exports = router;
