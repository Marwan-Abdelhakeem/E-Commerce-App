//import modules
import joi from "joi";
import { AppError } from "../utils/index.js";

const parseArray = (value, helper) => {
  let parsedValue = JSON.parse(value);
  let schema = joi.array().items(joi.string());
  const { error } = schema.validate(parsedValue, { abortEarly: false });
  if (error) {
    return helper("invalid data");
  } else {
    return true;
  }
};
export const generalFields = {
  name: joi.string(),
  description: joi.string().max(2000),
  objectId: joi.string().hex().length(24),
  price: joi.number().min(0),
  presageDiscount: joi.number().min(0).max(100),
  colors: joi.custom(parseArray),
  size: joi.custom(parseArray),
  stock: joi.number(),
  rate: joi.number().min(0).max(5),
};
export const isValid = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.params, ...req.query };
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const errArr = [];
      error.details.forEach((err) => {
        errArr.push(err.message);
      });
      return next(new AppError(errArr, 400));
    }
    next();
  };
};
