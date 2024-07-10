import Router from "express";
import * as wishlistController from "./wishlist.controller.js";
import * as authService from "../auth/auth.controller.js";
import {
  addWishlistValidation,
  removeWishlistValidation,
} from "./wishlist.validation.js";

const router = Router();

router.use(authService.auth, authService.allowedTo("user"));

router
  .route("/")
  .post(addWishlistValidation, wishlistController.addProductToWishlist)
  .get(wishlistController.getLoggedUserWishlist);

router
  .route("/:productId")
  .delete(
    removeWishlistValidation,
    wishlistController.removeProductFromWishlist
  );
export default router;
