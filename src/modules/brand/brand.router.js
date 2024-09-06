import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { isValid } from "../../middleware/validation.js";
import {
  createBrandVal,
  deleteBrandVal,
  getBrandVal,
  updateBrandVal,
} from "./brand.validation.js";
import { asyncHandler, cloudUpload, roles } from "../../utils/index.js";
import {
  createBrand,
  deleteBrand,
  getBrand,
  getBrands,
  updateBrand,
} from "./brand.controller.js";
const brandRouter = Router();

//create brand
brandRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).single("logo"),
  isValid(createBrandVal),
  asyncHandler(createBrand)
);

// update brand
brandRouter.put(
  "/:brandId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).single("logo"),
  isValid(updateBrandVal),
  asyncHandler(updateBrand)
);
// delete brand
brandRouter.delete(
  "/:brandId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUpload({}).single("logo"),
  isValid(deleteBrandVal),
  asyncHandler(deleteBrand)
);

// get brands
brandRouter.get("/", asyncHandler(getBrands));

// get category
brandRouter.get("/:brandId", isValid(getBrandVal), asyncHandler(getBrand));

export default brandRouter;
