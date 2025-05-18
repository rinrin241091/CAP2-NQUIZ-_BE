const categoryService = require("../services/categoryService");

exports.getCategoriesByUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const categories = await categoryService.getCategoriesByUser(userId);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ success: false, message: "Failed to get categories" });
  }
};

