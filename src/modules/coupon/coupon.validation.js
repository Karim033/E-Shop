import { body, check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import slugify from "slugify";
import CouponModel from "../../../DB/Models/coupon.model.js";

export const addCouponValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isUppercase()
    .withMessage("Name must be uppercase")
    .custom(async (value, { req }) => {
      const coupon = await CouponModel.findOne({ name: value });
      if (coupon) return Promise.reject("Coupon already exists");
    }),
  check("expire").notEmpty().withMessage("Expire date is required"),
  check("discount").notEmpty().withMessage("Discount is required"),

  validation,
];

export const getSpecificCouponValidation = [
  check("id").isMongoId().withMessage("Invalid brand id"),
  validation,
];

export const updateCouponValidation = [
  check("id").isMongoId().withMessage("Invalid brand id"),
  body("name")
    .optional()
    .custom(async (value, { req }) => {
      const coupon = await CouponModel.findOne({ name: value });
      if (coupon) return Promise.reject("This Updated Coupon in use");
    }),
  check("expire").optional(),
  check("discount").optional(),
  validation,
];

export const deleteCouponValidation = [
  check("id").isMongoId().withMessage("Invalid brand id"),
  validation,
];
