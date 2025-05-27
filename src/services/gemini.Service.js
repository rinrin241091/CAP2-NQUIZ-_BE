const axios = require("axios");
require("dotenv").config();

const generateExplanation = async (question) => {
  const url = process.env.GEMINI_API_URL;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `Giải thích ngắn gọn và dễ hiểu cho câu hỏi sau, tối đa 3-4 câu:\n\nCâu hỏi: "${question}"`;


  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await axios.post(`${url}?key=${apiKey}`, requestBody, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";
};


module.exports = { generateExplanation };
