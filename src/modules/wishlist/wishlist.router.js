import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import {
  addToWishlistVal,
  deleteFromWishlistVal,
} from "./wishlist.validation.js";
import { asyncHandler, roles } from "../../utils/index.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "./wishlist.controller.js";

const wishlistRouter = Router();

wishlistRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(addToWishlistVal),
  asyncHandler(addToWishlist)
);

wishlistRouter.get(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  asyncHandler(getWishlist)
);

wishlistRouter.delete(
  "/:productId",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(deleteFromWishlistVal),
  asyncHandler(removeFromWishlist)
);

export default wishlistRouter;
