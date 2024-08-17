// import modules
import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addProductVal = joi
  .object({
    name: generalFields.name.required(),
    description: generalFields.description.required(),
    category: generalFields.objectId.required(),
    subcategory: generalFields.objectId.required(),
    brand: generalFields.objectId.required(),
    price: generalFields.price.required(),
    discount: generalFields.presageDiscount.optional(),
    colors: generalFields.colors.optional(),
    size: generalFields.size.optional(),
    stock: generalFields.stock.optional(),
    rate: generalFields.rate.optional(),
  })
  .required();
