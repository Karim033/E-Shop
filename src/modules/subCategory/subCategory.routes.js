import express from "express";
import * as subCategoryController from "./subCategory.controller.js";
import * as authService from "../auth/auth.controller.js";

import {
  createSubCategoryValidator,
  deleteSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
} from "./subCategoryValidation.js";

// mergeParams : Allow us to access parameters from the parent route
// ex: We need to access the id of the category route
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    subCategoryController.setCategoryIdToBody,
    createSubCategoryValidator,
    subCategoryController.addSubCategory
  )
  .get(
    subCategoryController.createFilterObj,
    subCategoryController.listSubCategories
  );

router
  .route("/:id")
  .get(getSubCategoryValidator, subCategoryController.getSpesificCategory)
  .put(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    subCategoryController.updateSubCategory
  )
  .delete(
    authService.auth,
    authService.allowedTo("admin"),
    deleteSubCategoryValidator,
    subCategoryController.deleteSubCategory
  );
export default router;
