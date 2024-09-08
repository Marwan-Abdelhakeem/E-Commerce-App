import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import { addToCartVal, removeFromCartVal } from "./cart.validation.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { addToCart, getCart, removeFromCart } from "./cart.controller.js";

const cartRouter = Router();

cartRouter.get(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  asyncHandler(getCart)
);
cartRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(addToCartVal),
  asyncHandler(addToCart)
);
cartRouter.delete(
  "/:productId",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(removeFromCartVal),
  asyncHandler(removeFromCart)
);

export default cartRouter;
