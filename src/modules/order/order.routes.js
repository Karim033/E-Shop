import Router from "express";
import * as orderController from "./order.conroller.js";
import * as authService from "../auth/auth.controller.js";

const router = Router();

router.get(
  "/checkout-session/:cartId",
  authService.auth,
  authService.allowedTo("user"),
  orderController.checkoutSession
);

router
  .route("/:cartId")
  .post(
    authService.auth,
    authService.allowedTo("user"),
    orderController.createCashOrder
  );
router.get(
  "/",
  authService.auth,
  authService.allowedTo("user", "admin", "manager"),
  orderController.filterOrdersForLoggedUser,
  orderController.findAllOrders
);

router.put(
  "/:id/pay",
  authService.auth,
  authService.allowedTo("admin", "manager"),
  orderController.updateOrderToPaid
);
router.put(
  "/:id/deliver",
  authService.auth,
  authService.allowedTo("admin", "manager"),
  orderController.updateOrderDelivered
);

router.get("/:id", orderController.findSpecificOrder);

export default router;
