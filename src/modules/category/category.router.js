import { Router } from "express";
import { asyncHandler, cloudUpload, fileUpload } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import {
  addCategoryVal,
  deleteCategoryVal,
  getCategoryVal,
  updateCategoryVal,
} from "./category.validation.js";
import {
  addCategory,
  updateCategory,
  getSpecificCategory,
  getCategories,
  deleteCategory,
} from "./category.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
const categoryRouter = Router();

//add category
categoryRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  fileUpload({ folder: "category" }).single("image"),
  isValid(addCategoryVal),
  asyncHandler(addCategory)
);

// get categories
categoryRouter.get("/", asyncHandler(getCategories));

// get category
categoryRouter.get(
  "/:categoryId",
  isValid(getCategoryVal),
  asyncHandler(getSpecificCategory)
);

// update category
categoryRouter.put(
  "/:categoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  fileUpload({ folder: "category" }).single("image"),
  isValid(updateCategoryVal),
  asyncHandler(updateCategory)
);

// delete category
categoryRouter.delete(
  "/:categoryId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(deleteCategoryVal),
  asyncHandler(deleteCategory)
);

export default categoryRouter;
