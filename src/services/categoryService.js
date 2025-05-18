const categoryModel = require("../models/categoryModel");

exports.getCategoriesByUser = async (userId) => {
  return await categoryModel.findByUserId(userId);
};


