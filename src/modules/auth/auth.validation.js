import { check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import slugify from "slugify";
import UserModel from "../../../DB/Models/user.model.js";

export const signUpValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom((val) =>
      UserModel.findOne({ email: val }).then((user) => {
        if (user) return Promise.reject("E-mail already in use");
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Password Confirmation Incorrect");
      }
      return true;
    }),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword is required"),

  validation,
];

export const loginValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validation,
];
