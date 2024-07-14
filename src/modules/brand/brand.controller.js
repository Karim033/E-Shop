import BrandModel from "../../../DB/Models/brand.model.js";
import * as factory from "../../handlers-factory.js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";
import { uploadSingleImage } from "../../../middlewares/uploadImage.js";
// Upload Single Image
export const uploadBrandImage = uploadSingleImage("image");
// Image Processing
export const resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(900, 900)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);
    //   save image in db
    req.body.image = filename;
  }
  next();
});
// @desc Add brands
// @route POST /api/v1/brands
// @access Private/Admin-Manager
export const addBrands = factory.createDocument(BrandModel);
// @desc Get brands
// @route GET /api/v1/brands
// @access Public
export const getBrands = factory.getAll(BrandModel);

// @desc Get spesific brands
// @route GET /api/v1/brands/:id
// @access Public
export const getSpesificBrands = factory.getOne(BrandModel);

// @desc Update brands
// @route PUT /api/v1/brands/:id
// @access Private/Admin-Manager
export const updateBrands = factory.updateOne(BrandModel);

// @desc Delete brandss
// @route DELETE /api/v1/brands/:id
// @access Privates/Admin
export const deleteBrands = factory.deleteOne(BrandModel);
