import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import {
  addReviewVal,
  deleteReviewVal,
  editReviewVal,
  getAllReviewVal,
} from "./review.validation.js";
import { asyncHandler, roles } from "../../utils/index.js";
import {
  addReview,
  deleteReview,
  editReview,
  getAllReviewsOfProduct,
} from "./review.controller.js";
const reviewRouter = Router();

// add review
reviewRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(addReviewVal),
  asyncHandler(addReview)
);
// get All Reviews Of Product
reviewRouter.get(
  "/:productId",
  isValid(getAllReviewVal),
  asyncHandler(getAllReviewsOfProduct)
);

// edit review
reviewRouter.put(
  "/:reviewId",
  isAuthenticated(),
  isAuthorized(roles.ADMIN, roles.USER),
  isValid(editReviewVal),
  asyncHandler(editReview)
);
// delete review
reviewRouter.delete(
  "/:reviewId",
  isAuthenticated(),
  isAuthorized(roles.ADMIN, roles.USER),
  isValid(deleteReviewVal),
  asyncHandler(deleteReview)
);

export default reviewRouter;
