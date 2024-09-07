import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import {
  cerateCouponVal,
  deleteCouponVal,
  getCouponVal,
  updateCouponVal,
} from "./coupon.validation.js";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
} from "./coupon.controller.js";

const couponRouter = Router();
couponRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(cerateCouponVal),
  asyncHandler(createCoupon)
);
couponRouter.get(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  asyncHandler(getAllCoupons)
);
couponRouter.put(
  "/:couponId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(updateCouponVal),
  asyncHandler(updateCoupon)
);
couponRouter.get(
  "/:couponId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(getCouponVal),
  asyncHandler(getCouponById)
);
couponRouter.delete(
  "/:couponId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(deleteCouponVal),
  asyncHandler(deleteCoupon)
);

export default couponRouter;
