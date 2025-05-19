const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/participant", gameController.addParticipant);
router.post("/response", gameController.saveResponse);
router.post("/report", gameController.submitReport);

module.exports = router;
