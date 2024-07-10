import UserModel from "../../../DB/Models/user.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../../../utils/appError.js";

// @desc Add products to wishlist
// @route POST /api/v1/wishlist
// @access private/user
export const addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add product to wishlist array if it doesn't exist
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        wishlist: req.body.productId,
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "product added to wishlist",
    data: user.wishlist,
  });
});

// @desc Remove products from wishlist
// @route DELETE /api/v1/wishlist/:id
// @access private/user
export const removeProductFromWishlist = asyncHandler(
  // $pull => remove product from wishlist array if it exist
  async (req, res, next) => {
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          wishlist: req.params.productId,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      message: "product removed from wishlist",
      data: user.wishlist,
    });
  }
);

// @desc Get logged user wishlist
// @route GET /api/v1/wishlist
// @access private/user
export const getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishlist");
  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
