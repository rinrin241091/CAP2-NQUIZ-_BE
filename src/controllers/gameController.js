const gameService = require("../services/gameService");

const saveGameResults = async (req, res) => {
  try {
    console.log("Received game results:", req.body);
    const result = await gameService.saveFullGame(req.body);
    res.status(200).json({ success: true, message: "Game results saved", data: result });
  } catch (error) {
    console.error("❌ Error saving game results:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveGameResults
};
