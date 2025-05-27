const { generateExplanation } = require("../services/gemini.Service");
const explainQuestion = async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });
  }

  try {
    const explanation = await generateExplanation(question);
    res.status(200).json({ explanation });
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    console.error("Chi tiết:", error.response?.data || error); // Thêm dòng này để xem rõ lỗi
    res.status(500).json({ error: "Không thể lấy lời giải thích từ Gemini." });
  }
};


module.exports = { explainQuestion };

