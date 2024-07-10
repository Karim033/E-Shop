import { check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import ProductModel from "../../../DB/Models/product.model.js";
export const addWishlistValidation = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid User id")
    .custom(async (val, { req }) => {
      const product = await ProductModel.findById(val);
      if (!product) {
        return Promise.reject(new Error(`No product with id ${val}`));
      }
      return true;
    }),
  validation,
];

export const removeWishlistValidation = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid User id")
    .custom(async (val, { req }) => {
      const product = await ProductModel.findById(val);
      if (!product) {
        return Promise.reject(new Error(`No product with id ${val}`));
      }
      return true;
    }),
  validation,
];
