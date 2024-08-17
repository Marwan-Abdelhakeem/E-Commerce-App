import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { addProductVal } from "./product.validation.js";
import { addProduct, getAllProducts } from "./product.controller.js";
import { asyncHandler, cloudUpload } from "../../utils/index.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
const productRouter = Router();

// add product
productRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  isValid(addProductVal),
  asyncHandler(addProduct)
);

//get product
productRouter.get("/", asyncHandler(getAllProducts));

export default productRouter;
