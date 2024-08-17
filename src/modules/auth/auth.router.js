import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { loginVal } from "./auth.validation.js";
import { login, signup, verifyAccount } from "./auth.controller.js";
import { asyncHandler } from "../../utils/index.js";
const authRouter = Router();

// sign up
authRouter.post(
  "/signup",
  //   isValid(createBrandVal),
  asyncHandler(signup)
);

authRouter.get("/verify", asyncHandler(verifyAccount));

authRouter.post("/login", isValid(loginVal), asyncHandler(login));

export default authRouter;
