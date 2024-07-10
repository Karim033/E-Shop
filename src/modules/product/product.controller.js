import ProductModel from "../../../DB/Models/product.model.js";
import * as factory from "../../handlers-factory.js";
import sharp from "sharp";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import { uploadMultipleImages } from "../../../middlewares/uploadImage.js";

// Upload Multiple Image
export const uploadProductImages = uploadMultipleImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
// Image Processing
export const resizeImages = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);
    req.body.imageCover = imageCoverFileName;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imagesFileName = `product-${uuidv4()}-${Date.now()}-${
          index + 1
        }.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imagesFileName}`);
        //   save image in db
        req.body.images.push(imagesFileName);
      })
    );
  }
  next();
});
// @desc Add Products
// @route POST /api/v1/products
// @access Private/Admin-Manager
export const addProducts = factory.createDocument(ProductModel);
// @desc Get Products
// @route GET /api/v1/products
// @access Public
export const getProducts = factory.getAll(ProductModel, "products");

// @desc Get spesific product
// @route GET /api/v1/products/:id
// @access Public
export const getSpesificProduct = factory.getOne(ProductModel, "reviews");

// @desc Update spesific product
// @route PUT /api/v1/products/:id
// @access Private/Admin-Manager
export const updateProduct = factory.updateOne(ProductModel);

// @desc Delete product
// @route DELETE /api/v1/products/:id
// @access Private/Admin
export const deleteProduct = factory.deleteOne(ProductModel);
