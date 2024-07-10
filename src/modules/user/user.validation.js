import { body, check } from "express-validator";
import { validation } from "../../../middlewares/validation.js";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import UserModel from "../../../DB/Models/user.model.js";
export const addUserValidation = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
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

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Invalid phone number only accepts EG, SA, US phone number"),

  check("profileImage").optional(),

  check("role").optional(),
  validation,
];

export const getSpecificUserValidation = [
  check("id").isMongoId().withMessage("Invalid User id"),
  validation,
];

export const updateUserValidation = [
  check("id").isMongoId().withMessage("Invalid User id"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      console.log(value);
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Invalid phone number only accepts EG, SA, US phone number"),

  check("profileImage").optional(),

  check("role").optional(),
  validation,
];

export const changePasswordValidation = [
  check("id").isMongoId().withMessage("Invalid User id"),

  check("currentPassword")
    .notEmpty()
    .withMessage("Current Password is required"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirmPassword is required"),

  check("password")
    .notEmpty()
    .withMessage("password is required")
    .custom(async (val, { req }) => {
      // Check if the current password is correct
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error(`Not found user for this ${req.params.id}`);
      }
      const isMatchPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isMatchPassword) {
        throw new Error("Current password is not correct");
      }
      if (val !== req.body.confirmPassword) {
        throw new Error("Password Confirmation Incorrect");
      }
      return true;
    }),

  validation,
];

export const deleteUserValidation = [
  check("id").isMongoId().withMessage("Invalid User id"),
  validation,
];

export const updateLoggedUserValidation = [
  body("name")
    .optional()
    .custom((value, { req }) => {
      console.log(value);
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "en-US"])
    .withMessage("Invalid phone number only accepts EG, SA, US phone number"),
  validation,
];
