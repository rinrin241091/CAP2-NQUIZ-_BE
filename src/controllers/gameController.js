const gameService = require("../services/gameService");

const gameController = {
  async addParticipant(req, res) {
    try {
      const { sessionId, userId } = req.body;
      const participantId = await gameService.createParticipant(sessionId, userId);
      res.status(200).json({ success: true, participantId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async saveResponse(req, res) {
    try {
      const { participantId, questionId, answerId, isCorrect, responseTime } = req.body;
      await gameService.recordResponse(participantId, questionId, answerId, isCorrect, responseTime);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async submitReport(req, res) {
    try {
      const { sessionId, participantId, totalScore, correctAnswers, incorrectAnswers } = req.body;
      await gameService.saveReport(sessionId, participantId, totalScore, correctAnswers, incorrectAnswers);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = gameController;
