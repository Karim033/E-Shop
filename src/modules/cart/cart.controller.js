import AppError from "../../../utils/appError.js";
import asyncHandler from "express-async-handler";
import CartModel from "../../../DB/Models/cart.model.js";
import ProductModel from "../../../DB/Models/product.model.js";
import CouponModel from "../../../DB/Models/coupon.model.js";

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
// @desc Add product to cart
// @route POST /api/v1/cart
// @access private/User
export const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await ProductModel.findById(productId);
  // 1) get cart for logged user
  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    // 2) create new cart for logged user with product
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart => increase quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() == productId && item.color == color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      //product not exist in cart, push product to cart array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
        quantity: 1,
      });
    }
  }
  // calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "product added to cart successfully",
    data: cart,
  });
});

// @desc get logged user cart
// @route GET /api/v1/cart
// @access private/User
export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new AppError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }
  res.status(200).json({
    status: "success",
    results: cart.cartItems.length,
    data: cart,
  });
});

// @desc remove specific cart item
// @route DELETE /api/v1/cart/:itemid
// @access private/User
export const removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  calcTotalCartPrice(cart);
  await cart.save();
  res
    .status(200)
    .json({ status: "success", results: cart.cartItems.length, data: cart });
});

// @desc remove all cart item
// @route DELETE /api/v1/cart
// @access private/User
export const removeAllCartItem = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc Update specific cart item quantity
// @route PUT /api/v1/cart/:itemId
// @access private/User
export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new AppError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new AppError(`There is no item for this id: ${req.params.itemId}`, 404)
    );
  }
  calcTotalCartPrice(cart);
  cart.save();
  res
    .status(200)
    .json({ status: "success", results: cart.cartItems.length, data: cart });
});

// @desc Update specific cart item color
// @route PUT /api/v1/cart/:itemId
// @access private/User
export const updateCartItemColor = asyncHandler(async (req, res, next) => {
  const { color } = req.body;
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new AppError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.color = color;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new AppError(`There is no item for this id: ${req.params.itemId}`, 404)
    );
  }
  await cart.save();
  res
    .status(200)
    .json({ status: "success", results: cart.cartItems.length, data: cart });
});

// @desc Apply logged coupon on logged user cart
// @route PUT /api/v1/cart/apply-coupon
// @access private/User
export const applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) get coupon based on coupon name
  const coupon = await CouponModel.findOne({
    name: req.body.name,
    expire: { $gt: Date.now() },
  });
  if (!coupon) return next(new AppError(`Coupon is invalid or expired`, 404));

  // 2) get cart for logged user
  const cart = await CartModel.findOne({ user: req.user._id });
  const totalPrice = calcTotalCartPrice(cart);

  // 3) calculate price after discount
  const totalCartPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  // 4) update cart with new price
  cart.totalPriceAfterDiscount = totalCartPriceAfterDiscount;
  await cart.save();
  res
    .status(200)
    .json({ status: "success", results: cart.cartItems.length, data: cart });
});
