import UserModel from "../../../DB/Models/user.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../../../utils/appError.js";
import * as factory from "../../handlers-factory.js";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { uploadSingleImage } from "../../../middlewares/uploadImage.js";
import { createToken } from "../../../utils/createToken.js";

// Upload Single Image
export const uploadUserImage = uploadSingleImage("profileImage");
// Image Processing
export const resizeImages = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(900, 900)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);
    //   save image in db
    req.body.profileImage = filename;
  }

  next();
});
// @desc Add User
// @route POST /api/v1/users
// @access Private/Admin
export const addUser = factory.createDocument(UserModel);
// @desc Get Users
// @route GET /api/v1/users
// @access Private/Admin
export const getUsers = factory.getAll(UserModel);

// @desc Get spesific User by id
// @route GET /api/v1/users/:id
// @access Private/Admin
export const getSpesificUser = factory.getOne(UserModel);

// @desc Update User by id
// @route PUT /api/v1/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new AppError(`document not found ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc Change User Password by id
// @route put /api/v1/users/:id
// @access Privates/Admin
export const changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new AppError(`document not found ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
// @desc Delete User by id
// @route DELETE /api/v1/users/:id
// @access Privates/Admin
export const deleteUser = factory.deleteOne(UserModel);

// @desc Get Logged user data
// @route GET /api/v1/users/getme
// @access public/Auth
export const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc Update Logged user password
// @route PUT /api/v1/users/updatePassword
// @access public/Auth
export const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // update user password based user payload (req.use._id)
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc Update Logged user Data (Without Password and role)
// @route PUT /api/v1/users/updateData
// @access public/Auth
export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

// @desc Deactivate logged user
// @route DELETE /api/v1/users/deleteMe
// @access public/Auth
export const deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});
