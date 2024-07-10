import SubCategoryModel from "../../../DB/Models/subCategory.model.js";
import * as factory from "../../handlers-factory.js";

export const setCategoryIdToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Nested routes
//  GET /api/v1/categories/:categoryId/subcategories
export const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc Add SubCategory
// @route POST /api/v1/subcategory
// @access Private/Admin-Manager
export const addSubCategory = factory.createDocument(SubCategoryModel);

// @desc Get SubCategory
// @route GET /api/v1/subcategory
// @access Public
export const listSubCategories = factory.getAll(SubCategoryModel);
// @desc Get spesific SubCategory
// @route GET /api/v1/subcategory/:id
// @access Public
export const getSpesificCategory = factory.getOne(SubCategoryModel);

// @desc Update spesific SubCategory
// @route PUT /api/v1/subcategory/:id
// @access Private/Admin-Manager
export const updateSubCategory = factory.updateOne(SubCategoryModel);

// @desc Delete spesific SubCategory
// @route DELETE /api/v1/subcategory/:id
// @access Private/Admin
export const deleteSubCategory = factory.deleteOne(SubCategoryModel);
