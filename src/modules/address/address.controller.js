import UserModel from "../../../DB/Models/user.model.js";
import asyncHandler from "express-async-handler";

// @desc Add addresses to user addresses list
// @route POST /api/v1/addresses
// @access private/user
export const addaddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add addresses to user address array if it doesn't exist
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        addresses: req.body,
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Address added successfuly",
    data: user.addresses,
  });
});

// @desc Remove addresses from user addresses list
// @route DELETE /api/v1/addresses/:id
// @access private/user
export const removeAddresses = asyncHandler(
  // $pull => remove product from wishlist array if it exist
  async (req, res, next) => {
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          addresses: { _id: req.params.addressId },
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Addresses successfully removed",
      data: user.addresses,
    });
  }
);

// @desc Get logged user addresses
// @route GET /api/v1/addresses
// @access private/user
export const getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
