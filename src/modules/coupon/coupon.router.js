import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { cerateCouponVal } from "./coupon.validation.js";
import { createCoupon } from "./coupon.controller.js";

const couponRouter = Router();
couponRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(cerateCouponVal),
  asyncHandler(createCoupon)
);

export default couponRouter;
