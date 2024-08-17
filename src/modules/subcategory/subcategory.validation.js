// import modules
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addSubcategoryVal = joi
  .object({
    name: generalFields.name.required(),
    category: generalFields.objectId.required(),
  })
  .required();

export const getSubcategoryVal = joi
  .object({
    categoryId: generalFields.objectId.required(),
  })
  .required();

export const updateSubcategoryVal = joi
  .object({
    name: generalFields.name,
    subcategoryId: generalFields.objectId.required(),
  })
  .required();

export const deleteSubcategoryVal = joi
  .object({
    subcategoryId: generalFields.objectId.required(),
  })
  .required();
