import asyncHandler from "express-async-handler";
import CartModel from "../../../DB/Models/cart.model.js";
import OrderModel from "../../../DB/Models/order.model.js";
import ProductModel from "../../../DB/Models/product.model.js";
import UserModel from "../../../DB/Models/user.model.js";
import * as factory from "../../handlers-factory.js";
import AppError from "../../../utils/appError.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Create cash order
// @route POST /api/v1/order/:cartId
// @access Private/User
export const createCashOrder = asyncHandler(async (req, res, next) => {
  // app setting
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get user cart based on cart id
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart)
    return next(
      new AppError(`There in no cart with id: ${req.params.cartId}`, 404)
    );
  // 2) Get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create order with default paymentMethod cash
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) After creating order , decrement product quantity and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {});
    // 5) Delete user cart depend on cart id
    await CartModel.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: "success", data: order });
});

export const filterOrdersForLoggedUser = asyncHandler(
  async (req, res, next) => {
    if (req.user.role === "user") req.filterObj = { user: req.user._id };
    next();
  }
);
// @desc Get all orders
// @route GET /api/v1/order
// @access Private/User-Admin-Manager
export const findAllOrders = factory.getAll(OrderModel);

// @desc Get all orders
// @route GET /api/v1/order
// @access Private/User
export const findSpecificOrder = factory.getOne(OrderModel);

// @desc update order paid status to paid
// @route PUT /api/v1/order/:id/pay
// @access Private/Admin-Manager
export const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new AppError(`order not found with id: ${req.params.id}`, 404));
  }
  // Update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc update order delivered status
// @route PUT /api/v1/order/:id/deliver
// @access Private/Admin-Manager
export const updateOrderDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new AppError(`order not found with id: ${req.params.id}`, 404));
  }
  // Update order to paid
  order.isDelivered = true;
  order.deliverdAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc Get checkout session from stripe and send it as response
// @route GET /api/v1/order/checkout-session/:cartId
// @access Private/User
export const checkoutSession = asyncHandler(async (req, res, next) => {
  // app setting
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart)
    return next(
      new AppError(`There in no cart with id: ${req.params.cartId}`, 404)
    );
  // 2) Get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  // 4) Send session to response
  res.status(200).json({
    status: "success",
    session,
  });
});

const createOnlineOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await CartModel.findById(cartId);
  const user = await UserModel.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethod card
  const order = await OrderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });
  // 4) After creating order , decrement product quantity and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {});
    // 5) Delete user cart depend on cart id
    await CartModel.findByIdAndDelete(cartId);
  }
  res.status(200).json({ status: "success", data: order });
};

// @desc This  webhook will run stripe payment success paid
// @route POST /webhook-checkout
// @access Private/User
export const webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    // Create order
    createOnlineOrder(event.data.object);
  }
  res.status(200).json({ received: true });
});
