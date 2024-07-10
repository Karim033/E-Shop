import CouponModel from "../../../DB/Models/coupon.model.js";
import * as factory from "../../handlers-factory.js";

// @desc Add Coupon
// @route POST /api/v1/coupons
// @access Private/Admin-Manager
export const addCoupon = factory.createDocument(CouponModel);
// @desc Get List of Coupons
// @route GET /api/v1/coupons
// @access Private/Admin-Manager
export const getCoupon = factory.getAll(CouponModel);

// @desc Get spesific Coupon
// @route GET /api/v1/coupons/:id
// @access Private/Admin-Manager
export const getSpesificCoupon = factory.getOne(CouponModel);

// @desc Update Coupon
// @route PUT /api/v1/coupons/:id
// @access Private/Admin-Manager
export const updateCoupon = factory.updateOne(CouponModel);

// @desc Delete brands
// @route DELETE /api/v1/coupons/:id
// @access Private/Admin-Manager
export const deleteCoupon = factory.deleteOne(CouponModel);
