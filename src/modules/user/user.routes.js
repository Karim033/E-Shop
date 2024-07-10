import Router from "express";
import * as userController from "./user.controller.js";
import * as authService from "../auth/auth.controller.js";

import {
  addUserValidation,
  changePasswordValidation,
  deleteUserValidation,
  getSpecificUserValidation,
  updateLoggedUserValidation,
  updateUserValidation,
} from "./user.validation.js";

const router = Router();

router.use(authService.auth);

router.get(
  "/getMe",
  userController.getLoggedUserData,
  userController.getSpesificUser
);
router.put("/updatePassword", userController.updateLoggedUserPassword);

router.put(
  "/updateData",
  updateLoggedUserValidation,
  userController.updateLoggedUserData
);
router.delete("/deleteMe", userController.deleteLoggedUser);

// Admin
router.use(authService.allowedTo("admin"));
router
  .route("/")
  .post(
    userController.uploadUserImage,
    userController.resizeImages,
    addUserValidation,
    userController.addUser
  )
  .get(userController.getUsers);

router.put(
  "/changePassword/:id",
  changePasswordValidation,
  userController.changeUserPassword
);

router
  .route("/:id")
  .get(getSpecificUserValidation, userController.getSpesificUser)
  .put(
    userController.uploadUserImage,
    userController.resizeImages,
    updateUserValidation,
    userController.updateUser
  )
  .delete(deleteUserValidation, userController.deleteUser);

export default router;
