import UserModel from "../../../DB/Models/user.model.js";
import AppError from "../../../utils/appError.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../../utils/sendEmail.js";
import { createToken } from "../../../utils/createToken.js";
import { sanitizeUser } from "../../../utils/sanitized-data.js";

// @desc Sign Up
// @route POST /api/v1/auth/signup
// @access public
export const signUp = asyncHandler(async (req, res, next) => {
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = createToken(user._id);
  const cokkieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE_TIME || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cokkieOptions.secure = true;
  res.cookie("jwt", token, cokkieOptions);
  res.status(201).json({ data: sanitizeUser(user), token });
});
// @desc login
// @route POST /api/v1/auth/login
// @access public
export const login = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = createToken(user._id);
  const cokkieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRE_TIME || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cokkieOptions.secure = true;
  res.cookie("jwt", token, cokkieOptions);
  res.status(200).json({ data: sanitizeUser(user), token });
});

// @desc make sure the user is logged in
export const auth = asyncHandler(async (req, res, next) => {
  // 1) check if token exists or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("Please login first", 401));
  }
  // 2) verify token (no change happened about token)
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  // 3) check if user still exists
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(new AppError("User not found", 401));
  }
  // 4) check if user changed password after token was created
  if (currentUser.passwordChangeAt) {
    const passwordChangeTimeStamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000
    );
    if (passwordChangeTimeStamp > decoded.iat) {
      return next(
        new AppError("User recently changed password. Please login again", 401)
      );
    }
  }
  req.user = currentUser;
  next();
});

// @desc Authorization (User Permission)
export const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not allowed to perform this action", 403)
      );
    }
    next();
  });

// @desc Forgrt Password
// @route POST /api/v1/auth/forgetPassword
// @access public
export const forgetPassword = asyncHandler(async (req, res, next) => {
  // 1) get user by email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) generate random hash reset code of 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResestCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hashed password reset code into db
  user.passwordResetCode = hashedResestCode;
  // Add expiration date to reset code (10 Minutes)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerfied = false;
  await user.save();
  // 3) send the reset code via email
  const message = `
  Hi ${user.name},\n
  We recieved a request to reset the password on your E-shop Account.
  \n ${resetCode} is your password reset code.
  \n If you did not request a password reset, please ignore this email.
  `;
  //  IF THERE IS ERROR IN SENDING EMAIL, REMOVE THE CODE FROM DB AND RETURN ERROR MESSAGE
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset code (Valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerfied = undefined;
    await user.save();
    return next(new AppError("There was an error sending email", 500));
  }
  res.status(200).json({
    status: "Success",
    message: "Password reset code sent to your email",
  });
});

// @desc Verify Forgrt Password
// @route POST /api/v1/auth/verifyForgetPassword
// @access public
export const verifyPasswordReserCode = asyncHandler(async (req, res, next) => {
  // get user based on reset code
  const hashedResestCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetCode: hashedResestCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Reset code invalid or expired", 400));
  }
  // Reset code valid
  user.passwordResetVerfied = true;
  await user.save();
  res.status(200).json({ status: "Success" });
});

// @desc  Reset Password
// @route POST /api/v1/auth/resetPassword
// @access public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get user based on email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // check if reset code is verfied
  if (!user.passwordResetVerfied)
    return next(new AppError("Reset code Not Verified", 400));

  // update password
  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerfied = undefined;
  await user.save();
  res.status(200).json({ status: "Success" });

  // if every things ok, generate new token

  const token = createToken(user._id);
  res.status(200).json({ token });
});
