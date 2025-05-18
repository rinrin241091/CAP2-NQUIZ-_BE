const categoryService = require('../services/addCategories.service');

const createCategory = async (req, res) => {
  try {
    const userId = req.user.user_id; // lấy từ token (middleware auth gán req.user)
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const result = await categoryService.createCategory(userId, name);

    res.status(201).json({ message: "Category added successfully", categoryId: result.insertId });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createCategory };
