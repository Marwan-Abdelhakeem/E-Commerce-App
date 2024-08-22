import { Router } from "express";
import { roles } from "../../utils/constant/enums.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { asyncHandler } from "../../utils/index.js";
import {
  addToWishlist,
  getWishlist,
  deleteFromWishlist,
} from "./wishlist.controller.js";

const wishlistRouter = Router();

// add review
wishlistRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(addToWishlist)
);

wishlistRouter.get(
  "/",
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(getWishlist)
);
// todo validation
wishlistRouter.delete(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.USER]),
  asyncHandler(deleteFromWishlist)
);

export default wishlistRouter;
