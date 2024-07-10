import Router from "express";
import * as brandsController from "./brand.controller.js";
import * as authService from "../auth/auth.controller.js";

import {
  addBrandValidation,
  deleteBrandValidation,
  getSpecificBrandValidation,
  updateBrandValidation,
} from "./brand.validation.js";

const router = Router();

router
  .route("/")
  .post(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    brandsController.uploadBrandImage,
    brandsController.resizeImages,
    addBrandValidation,
    brandsController.addBrands
  )
  .get(brandsController.getBrands);
router
  .route("/:id")
  .get(getSpecificBrandValidation, brandsController.getSpesificBrands)
  .put(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    brandsController.uploadBrandImage,
    brandsController.resizeImages,
    updateBrandValidation,
    brandsController.updateBrands
  )
  .delete(
    authService.auth,
    authService.allowedTo("admin"),
    deleteBrandValidation,
    brandsController.deleteBrands
  );

export default router;
