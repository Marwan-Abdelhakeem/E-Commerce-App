import { Coupon } from "../../../db/index.js";
import { AppError, couponTypes, messages } from "../../utils/index.js";

export const createCoupon = async (req, res, next) => {
  const { code, discount, couponType, fromDate, toDate } = req.body;
  const couponExist = await Coupon.findOne({ code });
  if (couponExist) {
    return next(new AppError(messages.coupon.alreadyExist, 409));
  }
  if (couponType == couponTypes.PERCENTAGE && discount > 100) {
    return next(new AppError("must between 0, 100", 400));
  }
  const createdCoupon = await Coupon.create({
    code,
    discount,
    couponType,
    fromDate,
    toDate,
    createdBy: req.authUser._id,
  });
  return res.status(201).json({
    message: messages.coupon.createdSuccessfully,
    success: true,
    data: createCoupon,
  });
};
