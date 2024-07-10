import { body, check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import slugify from "slugify";

export const addCategoryValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name"),
  body("name").custom((value, { req }) => {
    req.body.slug = slugify(value);
    return true;
  }),
  validation,
];

export const getSpecificCategoryValidation = [
  check("id").isMongoId().withMessage("Invalid category id"),
  validation,
];

export const updateCategoryValidation = [
  check("id").isMongoId().withMessage("Invalid category id"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validation,
];

export const deleteCategoryValidation = [
  check("id").isMongoId().withMessage("Invalid category id"),
  validation,
];
