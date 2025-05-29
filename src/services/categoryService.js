const categoryModel = require("../models/categoryModel");

exports.getCategoriesByUser = async (userId) => {
  return await categoryModel.findByUserId(userId);
};

exports.createCategory = async ({ category_name, user_id }) => {
  return await categoryModel.create({ category_name, user_id });
};

exports.deleteCategory = async (categoryId, userId) => {
  return await categoryModel.deleteByIdAndUser(categoryId, userId);
};
