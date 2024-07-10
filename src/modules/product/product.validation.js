import { check, body } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import CategoryModel from "../../../DB/Models/category.model.js";
import SubCategoryModel from "../../../DB/Models/subCategory.model.js";
import slugify from "slugify";

export const createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required"),
  body("title").custom((value, { req }) => {
    req.body.slug = slugify(value);
    return true;
  }),
  check("description")
    .notEmpty()
    .withMessage("Too long description")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Quantity must be number"),
  check("sold").optional().isNumeric().withMessage("sold must be number"),
  check("price")
    .notEmpty()
    .withMessage("price is required")
    .isNumeric()
    .withMessage("price must be number")
    .isLength({ max: 32 })
    .withMessage("Too long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("priceAfterDiscount must be number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),
  check("colors").optional().isArray().withMessage("colors must be array"),
  check("imageCover").notEmpty().withMessage("imageCover is required"),
  check("images").optional().isArray().withMessage("images must be array"),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom(async (categoryId) => {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return Promise.reject(new Error(`No category with id ${categoryId}`));
      }
    }),

  check("subCategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid subCategory ID format")
    .custom(async (subCategoriesIds) => {
      const subCategories = await SubCategoryModel.find({
        _id: { $exists: true, $in: subCategoriesIds },
      });
      if (
        subCategories.length < 1 ||
        subCategories.length !== subCategoriesIds.length
      ) {
        return Promise.reject(new Error(`In-valid subcategories ids`));
      }
    })
    .custom((val, { req }) =>
      SubCategoryModel.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCatIdInDB = [];
          subCategories.forEach((subCategory) => {
            subCatIdInDB.push(subCategory._id.toString());
          });
          //   Check if subcategories ids in db include subcategories in req.body (true/false)
          if (!val.every((v) => subCatIdInDB.includes(v))) {
            return Promise.reject(
              new Error(`subcategory not belong to category`)
            );
          }
        }
      )
    ),
  check("brand").optional().isMongoId().withMessage("Invalid brand ID format"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Ratings must be number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings must be number"),
  validation,
];

export const getSpecificProductValidation = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  validation,
];

export const updateProductValidation = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  body("title")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validation,
];

export const deleteProductValidation = [
  check("id").isMongoId().withMessage("Invalid Product id"),
  validation,
];
