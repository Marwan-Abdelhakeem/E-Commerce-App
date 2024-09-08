import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addReviewVal = joi
  .object({
    productId: generalFields.objectId.required(),
    rate: generalFields.rate.required(),
    comment: joi.string().required(),
  })
  .required();

export const deleteReviewVal = joi
  .object({
    reviewId: generalFields.objectId.required(),
  })
  .required();

export const editReviewVal = joi
  .object({
    reviewId: generalFields.objectId.required(),
    rate: generalFields.rate,
    comment: joi.string(),
  })
  .required();

export const getAllReviewVal = joi
  .object({
    productId: generalFields.objectId.required(),
  })
  .required();
