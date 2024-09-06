import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import {
  addSubcategoryVal,
  deleteSubcategoryVal,
  getSubcategoryVal,
  updateSubcategoryVal,
} from "./subcategory.validation.js";
import { asyncHandler, cloudUpload, roles } from "../../utils/index.js";
import {
  addSubcategory,
  deleteSubcategory,
  getSubcategory,
  updateSubcategory,
} from "./subcategory.controller.js";
const subcategoryRouter = Router();

//add subcategory
subcategoryRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).single("image"),
  isValid(addSubcategoryVal),
  asyncHandler(addSubcategory)
);

//get subcategory
subcategoryRouter.get(
  "/:categoryId",
  isValid(getSubcategoryVal),
  asyncHandler(getSubcategory)
);
// update subcategory
subcategoryRouter.put(
  "/:subcategoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).single("image"),
  isValid(updateSubcategoryVal),
  asyncHandler(updateSubcategory)
);

// delete subcategory
subcategoryRouter.delete(
  "/:subcategoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  isValid(deleteSubcategoryVal),
  asyncHandler(deleteSubcategory)
);
export default subcategoryRouter;
