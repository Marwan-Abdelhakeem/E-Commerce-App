import joi from "joi";
import { roles } from "../../utils/index.js";

// signup validation
export const signupVal = joi.object({
  userName: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().required(),
  password: joi.string(),
  DOB: joi
    .date()
    .less(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000)
    .required()
    .messages({
      "date.less": "Date of birth must be more than 10 years ago.",
      "any.required": "Date of birth is required.",
    }),
  role: joi
    .string()
    .valid(...Object.values(roles))
    .default(roles.USER),
  // .required(),
});

// login validation
export const loginVal = joi.object({
  email: joi.string().email().when("phone", {
    is: joi.exist(),
    then: joi.optional(),
    otherwise: joi.required(),
  }),
  phone: joi.string(),
  password: joi.string(),
});

// forgot password validation
export const forgotPasswordVal = joi.object({
  email: joi.string().email().required(),
});

// update account validation
export const updateAccountVal = joi.object({
  userName: joi.string(),
  phone: joi.string(),
  password: joi.string(),
  DOB: joi
    .date()
    .less(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000)
    .messages({
      "date.less": "Date of birth must be more than 10 years ago.",
    }),
});
