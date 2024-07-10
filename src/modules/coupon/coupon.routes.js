import Router from "express";
import * as couponController from "./coupon.controller.js";
import * as authService from "../auth/auth.controller.js";
import {
  addCouponValidation,
  deleteCouponValidation,
  getSpecificCouponValidation,
  updateCouponValidation,
} from "./coupon.validation.js";

const router = Router();

router.use(authService.auth, authService.allowedTo("admin", "manager"));

router
  .route("/")
  .post(addCouponValidation, couponController.addCoupon)
  .get(couponController.getCoupon);
router
  .route("/:id")
  .get(getSpecificCouponValidation, couponController.getSpesificCoupon)
  .put(updateCouponValidation, couponController.updateCoupon)
  .delete(deleteCouponValidation, couponController.deleteCoupon);

export default router;
