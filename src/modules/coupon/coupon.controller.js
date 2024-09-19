import { Coupon } from "../../../db/index.js";
import { AppError, couponTypes, messages } from "../../utils/index.js";

export const createCoupon = async (req, res, next) => {
  const { code, discount, couponType, fromDate, toDate, assignedToUser } =
    req.body;
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
    assignedToUser,
    createdBy: req.authUser._id,
  });
  return res.status(201).json({
    message: messages.coupon.createdSuccessfully,
    success: true,
    data: createdCoupon,
  });
};

export const getAllCoupons = async (req, res, next) => {
  const coupons = await Coupon.find();
  return res.status(200).json({
    success: true,
    data: coupons,
  });
};

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }
  return res.status(200).json({
    success: true,
    data: coupon,
  });
};

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { code, discount, couponType, fromDate, toDate } = req.body;

  if (couponType == couponTypes.PERCENTAGE && discount > 100) {
    return next(new AppError("must between 0, 100", 400));
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    {
      code,
      discount,
      couponType,
      fromDate,
      toDate,
    },
    { new: true }
  );
  if (!updatedCoupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }

  return res.status(200).json({
    message: messages.coupon.updatedSuccessfully,
    success: true,
    data: updatedCoupon,
  });
};

export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

  if (!deletedCoupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }

  return res.status(200).json({
    message: messages.coupon.deletedSuccessfully,
    success: true,
  });
};
