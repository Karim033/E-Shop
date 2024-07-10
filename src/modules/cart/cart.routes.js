import Router from "express";
import * as cartController from "./cart.controller.js";
import * as authService from "../auth/auth.controller.js";
const router = Router();

router.use(authService.auth, authService.allowedTo("user"));

router
  .route("/")
  .post(cartController.addProductToCart)
  .get(cartController.getCart)
  .delete(cartController.removeAllCartItem);

router.put("/apply-coupon", cartController.applyCoupon);

router
  .route("/:itemId")
  .delete(cartController.removeSpecificCartItem)
  .put(cartController.updateCartItemQuantity)
  .patch(cartController.updateCartItemColor);

export default router;
