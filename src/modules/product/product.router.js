import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import {
  addProductVal,
  deleteProductVal,
  updateProductVal,
} from "./product.validation.js";
import { asyncHandler, cloudUpload, roles } from "../../utils/index.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "./product.controller.js";
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
// update product
productRouter.put(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  isValid(updateProductVal),
  asyncHandler(updateProduct)
);
// delete product
productRouter.delete(
  "/:productId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteProductVal),
  asyncHandler(deleteProduct)
);
//get product
productRouter.get("/", asyncHandler(getAllProducts));

export default productRouter;
