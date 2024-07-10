import Router from "express";
import * as categoryController from "./category.controller.js";
import subCategoryRouter from "../subCategory/subCategory.routes.js";
import * as authService from "../auth/auth.controller.js";
import {
  addCategoryValidation,
  deleteCategoryValidation,
  getSpecificCategoryValidation,
  updateCategoryValidation,
} from "./category.validation.js";

const router = Router();
// Nested Routes
router.use("/:categoryId/subcategories", subCategoryRouter);

router
  .route("/")
  .post(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    categoryController.uploadCategoryimage,
    categoryController.resizeImages,
    addCategoryValidation,
    categoryController.addCategory
  )
  .get(categoryController.getCategories);

router
  .route("/:id")
  .get(getSpecificCategoryValidation, categoryController.getSpesificCategory)
  .put(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    categoryController.uploadCategoryimage,
    categoryController.resizeImages,
    updateCategoryValidation,
    categoryController.updateCategory
  )
  .delete(
    authService.auth,
    authService.allowedTo("admin"),
    deleteCategoryValidation,
    categoryController.deleteCategory
  );

export default router;
