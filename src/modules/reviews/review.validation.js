import { check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import ReviewModel from "../../../DB/Models/review.model.js";

export const addReviewValidation = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Ratings is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value be between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid Review id"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review id")
    .custom((val, { req }) => {
      return ReviewModel.findOne({
        user: req.user._id,
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(
            new Error("You have already reviewed this product")
          );
        }
      });
    }),
  validation,
];

export const getSpecificReviewValidation = [
  check("id").isMongoId().withMessage("Invalid Review id"),
  validation,
];

export const updateReviewValidation = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id")
    .custom((val, { req }) =>
      // Check review ownership before update
      ReviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review with id ${val}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  validation,
];

export const deleteBrandValidation = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return ReviewModel.findById(val).then((review) => {
          if (!review)
            return Promise.reject(
              new Error(`There is no review with id ${val}`)
            );
          if (review.user._id.toString() !== req.user._id.toString())
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
        });
      }
      return true;
    }),
  validation,
];
