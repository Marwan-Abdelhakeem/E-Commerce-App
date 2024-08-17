import { User } from "../../db/models/user.model.js";
import { status } from "../utils/constant/enums.js";
import { AppError } from "../utils/error.js";
import { messages } from "../utils/index.js";
import { verifyToken } from "../utils/token.js";

export const isAuthenticated = () => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const [bearer, token] = authorization.split(" ");
    // check token verify
    let result = "";
    if (bearer == "access-token") {
      result = verifyToken({
        token,
        secretKey: process.env.secretKeyAccessToken,
      });
    } else if (bearer == "reset-password") {
      result = verifyToken({
        token,
        secretKey: process.env.secretKeyResetPassword,
      });
    }
    if (result.message) {
      return next(new AppError(result.message));
    }
    // check user
    const user = await User.findOne({
      email: result.email,
      status: status.VERIFIED,
    }).select("-password");
    if (!user) {
      return next(new AppError(messages.user.notFound, 404));
    }
    req.authUser = user;
    next();
  };
};
