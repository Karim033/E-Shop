import express from "express";
import * as reviewController from "./review.controller.js";
import * as authService from "../auth/auth.controller.js";
import {
  addReviewValidation,
  deleteBrandValidation,
  getSpecificReviewValidation,
  updateReviewValidation,
} from "./review.validation.js";
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authService.auth,
    authService.allowedTo("user"),
    reviewController.setProductIdAndUserIdToBody,
    addReviewValidation,
    reviewController.addReview
  )
  .get(reviewController.createFilterObj, reviewController.getReview);

router
  .route("/:id")
  .get(getSpecificReviewValidation, reviewController.getSpesificReview)
  .put(
    authService.auth,
    authService.allowedTo("user"),
    updateReviewValidation,
    reviewController.updateReview
  )
  .delete(
    authService.auth,
    authService.allowedTo("user", "admin", "manager"),
    deleteBrandValidation,
    reviewController.deleteReview
  );

export default router;
