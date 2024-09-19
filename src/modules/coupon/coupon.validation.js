import joi from "joi";
import { couponTypes } from "../../utils/index.js";
import { generalFields } from "../../middleware/validation.js";

export const cerateCouponVal = joi.object({
  code: joi.string().required(),
  discount: joi.number().positive(),
  couponType: joi
    .string()
    .valid(...Object.values(couponTypes))
    .required(),
  fromDate: joi
    .date()
    .greater(Date.now() - 24 * 60 * 60 * 1000)
    .required(),
  toDate: joi.date().greater(joi.ref("fromDate")),
  assignedToUser: joi.array().items(
    joi.object({
      user: generalFields.objectId.required(),
      maxUse: joi.number().integer().min(1).max(5).required(), // Must be between 1 and 5
    })
  ),
});

export const getCouponVal = joi.object({
  couponId: generalFields.objectId.required(),
});

export const updateCouponVal = joi.object({
  couponId: generalFields.objectId.required(),
  code: joi.string(),
  discount: joi.number().positive(),
  couponType: joi.string().valid(...Object.values(couponTypes)),
  fromDate: joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
  toDate: joi.date().greater(joi.ref("fromDate")),
});

export const deleteCouponVal = joi.object({
  couponId: generalFields.objectId.required(),
});
