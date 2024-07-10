import Router from "express";
import * as productController from "./product.controller.js";
import * as authService from "../auth/auth.controller.js";
import reviewsRouter from "../reviews/review.routes.js";
import {
  createProductValidator,
  deleteProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
} from "./product.validation.js";

const router = Router();

// POST    /products/sdf464f6s5d4fsdf/reviews
// GET     /products/sdf464f6s5d4fsdf/reviews
// GET     /products/sdf464f6s5d4fsdf/reviews/sdf464f6s5d4fsdf
router.use("/:productId/reviews", reviewsRouter);

router
  .route("/")
  .post(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    productController.uploadProductImages,
    productController.resizeImages,
    createProductValidator,
    productController.addProducts
  )
  .get(productController.getProducts);

router
  .route("/:id")
  .get(getSpecificProductValidation, productController.getSpesificProduct)
  .put(
    authService.auth,
    authService.allowedTo("admin", "manager"),
    productController.uploadProductImages,
    productController.resizeImages,
    updateProductValidation,
    productController.updateProduct
  )
  .delete(
    authService.auth,
    authService.allowedTo("admin"),
    deleteProductValidation,
    productController.deleteProduct
  );

export default router;
