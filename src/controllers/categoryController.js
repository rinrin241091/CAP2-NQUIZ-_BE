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

exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { category_name } = req.body;
    const newCategory = await categoryService.createCategory({ category_name, user_id: userId });
    res.status(201).json({ success: true, message: "Category created", data: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const categoryId = req.params.id;
    const result = await categoryService.deleteCategory(categoryId, userId);
    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: "Category not found or unauthorized" });
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};
