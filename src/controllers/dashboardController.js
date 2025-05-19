const dashboardService = require('../services/dashboard.service');

// Trả về tổng số người dùng
const getTotalUsers = async (req, res) => {
  try {
    const result = await dashboardService.getTotalUsers();
    res.json(result);
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ error: "Failed to fetch total users" });
  }
};

// Trả về tổng số bài quiz
const getTotalQuizzes = async (req, res) => {
  try {
    const result = await dashboardService.getTotalQuizzes();
    res.json(result);
  } catch (error) {
    console.error("Error fetching total quizzes:", error);
    res.status(500).json({ error: "Failed to fetch total quizzes" });
  }
};

// Trả về tổng lượt chơi
const getTotalPlay = async (req, res) => {
  try {
    const result = await dashboardService.getTotalPlay();
    res.json(result);
  } catch (error) {
    console.error("Error fetching total play count:", error);
    res.status(500).json({ error: "Failed to fetch total play count" });
  }
};
const getPerformanceChartData = async (req, res) => {
  try {
    const { range } = req.query; // lấy range từ query
    const data = await dashboardService.getPerformanceChartData(range || '7days');
    res.json(data);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};

module.exports = {
  getTotalUsers,
  getTotalQuizzes,
  getTotalPlay,
  getPerformanceChartData,
};
