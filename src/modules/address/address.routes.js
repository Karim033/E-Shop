import Router from "express";
import * as addressesController from "./address.controller.js";
import * as authService from "../auth/auth.controller.js";

const router = Router();

router.use(authService.auth, authService.allowedTo("user"));

router
  .route("/")
  .post(addressesController.addaddress)
  .get(addressesController.getLoggedUserAddresses);

router.route("/:addressId").delete(addressesController.removeAddresses);
export default router;
