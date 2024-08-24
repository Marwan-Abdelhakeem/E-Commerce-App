import joi from "joi";
import { paymentMethods } from "../../utils/index.js";

export const cerateOrderVal = joi.object({
  phone: joi.string(),
  street: joi.string(),
  paymentMethod: joi
    .string()
    .valid(...Object.values(paymentMethods))
    .required(),
    coupon: joi.string(),
});
