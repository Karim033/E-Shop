import ReviewModel from "../../../DB/Models/review.model.js";
import * as factory from "../../handlers-factory.js";

// Nested route (Create)
export const setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
// Nested routes
//  GET /api/v1/products/:productId/reviews
export const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @desc Add review
// @route POST /api/v1/reviews
// @access private/auth/user
export const addReview = factory.createDocument(ReviewModel);
// @desc Get reviews
// @route GET /api/v1/reviews
// @access Public
export const getReview = factory.getAll(ReviewModel);

// @desc Get spesific reviews
// @route GET /api/v1/reviews/:id
// @access Public
export const getSpesificReview = factory.getOne(ReviewModel);

// @desc Update reviews
// @route PUT /api/v1/reviews/:id
// @access private/auth/user
export const updateReview = factory.updateOne(ReviewModel);

// @desc Delete reviews
// @route DELETE /api/v1/reviews/:id
// @access private/auth/User-Admin-Manager
export const deleteReview = factory.deleteOne(ReviewModel);
