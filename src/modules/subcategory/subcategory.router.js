import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import {
  addSubcategoryVal,
  deleteSubcategoryVal,
  getSubcategoryVal,
  updateSubcategoryVal,
} from "./subcategory.validation.js";
import { asyncHandler, cloudUpload, fileUpload } from "../../utils/index.js";
import {
  addSubcategory,
  deleteSubcategory,
  getSubcategory,
  updateSubcategory,
} from "./subcategory.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
const subcategoryRouter = Router();

//add subcategory
subcategoryRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  fileUpload({ folder: "subcategory" }).single("image"),
  isValid(addSubcategoryVal),
  asyncHandler(addSubcategory)
);

//get subcategory
subcategoryRouter.get(
  "/:categoryId",
  isValid(getSubcategoryVal),
  asyncHandler(getSubcategory)
);
// note
// update subcategory
subcategoryRouter.put(
  "/:subcategoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  fileUpload({ folder: "subcategory" }).single("image"),
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
