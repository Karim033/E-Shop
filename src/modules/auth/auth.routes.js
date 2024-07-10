import Router from "express";
import * as authController from "./auth.controller.js";
import { loginValidation, signUpValidation } from "./auth.validation.js";

const router = Router();

router.route("/signup").post(signUpValidation, authController.signUp);

router.post("/login", loginValidation, authController.login);

router.post("/forgetPassword", authController.forgetPassword);

router.post("/verifyForgetPassword", authController.verifyPasswordReserCode);

router.put("/resetPassword", authController.resetPassword);

export default router;
