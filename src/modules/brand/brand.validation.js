// import modules
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createBrandVal = joi
  .object({
    name: generalFields.name.required(),
  })
  .required();

export const updateBrandVal = joi
  .object({
    name: generalFields.name,
    brandId: generalFields.objectId.required(),
  })
  .required();

export const getSubcategoryVal = joi
  .object({
    categoryId: generalFields.objectId.required(),
  })
  .required();

export const deleteSubcategoryVal = joi
  .object({
    subcategoryId: generalFields.objectId.required(),
  })
  .required();
