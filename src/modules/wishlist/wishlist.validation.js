import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addToWishlistVal = joi.object({
  productId: generalFields.objectId.required(),
});
export const deleteFromWishlistVal = joi.object({
  productId: generalFields.objectId.required(),
});
