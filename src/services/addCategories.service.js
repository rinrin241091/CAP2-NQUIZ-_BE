const addCategoryModel = require('../models/addCategories.model');

const createCategory = (userId, categoryName) => {
  return new Promise((resolve, reject) => {
    addCategoryModel.addCategory(userId, categoryName, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = { createCategory };
