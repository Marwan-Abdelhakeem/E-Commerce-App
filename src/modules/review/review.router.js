import { Router } from "express";
import { asyncHandler } from "../../utils/index.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
import { addReview, deleteReview } from "./review.controller.js";
const reviewRouter = Router();

// add review
reviewRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  asyncHandler(addReview)
);

// delete review
reviewRouter.delete(
  "/reviewId",
  isAuthenticated(),
  isAuthorized(roles.ADMIN, roles.USER),
  asyncHandler(deleteReview)
);

export default reviewRouter;
