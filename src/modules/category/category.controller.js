import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import CategoryModel from "../../../DB/Models/category.model.js";
import * as factory from "../../handlers-factory.js";
import asyncHandler from "express-async-handler";
import { uploadSingleImage } from "../../../middlewares/uploadImage.js";

// Upload Single Image
export const uploadCategoryimage = uploadSingleImage("image");
// Image Processing
export const resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(900, 900)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);
    //   save image in db
    req.body.image = filename;
  }
  next();
});

// @desc Add category
// @route POST /api/v1/categories
// @access Private/Admin-Manager
export const addCategory = factory.createDocument(CategoryModel);
// @desc Get categories
// @route GET /api/v1/categories
// @access Public
export const getCategories = factory.getAll(CategoryModel);

// @desc Get spesific category
// @route GET /api/v1/categories/:id
// @access Public
export const getSpesificCategory = factory.getOne(CategoryModel);

// @desc Update category
// @route PUT /api/v1/categories/:id
// @access Private/Admin-Manager
export const updateCategory = factory.updateOne(CategoryModel);

// @desc Delete category
// @route DELETE /api/v1/categories/:id
// @access Private/Admin
export const deleteCategory = factory.deleteOne(CategoryModel);
