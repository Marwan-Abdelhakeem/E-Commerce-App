import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { createBrandVal, updateBrandVal } from "./brand.validation.js";
import { createBrand, updateBrand } from "./brand.controller.js";
import { asyncHandler, cloudUpload } from "../../utils/index.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { roles } from "../../utils/constant/enums.js";
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

export default brandRouter;
