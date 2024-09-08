import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import {
  forgotPasswordVal,
  loginVal,
  signupVal,
  updateAccountVal,
} from "./auth.validation.js";
import {
  forgotPassword,
  login,
  logout,
  signup,
  updateAccount,
  verifyAccount,
} from "./auth.controller.js";
import { asyncHandler, cloudUpload } from "../../utils/index.js";
const authRouter = Router();

authRouter.post("/signup", isValid(signupVal), asyncHandler(signup));
authRouter.get("/verify", asyncHandler(verifyAccount));
authRouter.post("/login", isValid(loginVal), asyncHandler(login));
authRouter.post(
  "/forgot-password",
  isValid(forgotPasswordVal),
  asyncHandler(forgotPassword)
);
authRouter.post("/logout", isAuthenticated(), asyncHandler(logout));
authRouter.put(
  "/update-account",
  isAuthenticated(),
  cloudUpload({}).single("image"),
  isValid(updateAccountVal),
  asyncHandler(updateAccount)
);

export default authRouter;
