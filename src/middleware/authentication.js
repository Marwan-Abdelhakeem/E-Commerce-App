import { User } from "../../db/index.js";
import { messages, AppError, status, verifyToken } from "../utils/index.js";

export const isAuthenticated = () => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new AppError("please login", 401));
    }
    const [bearer, token] = authorization.split(" ");
    // check token verify
    let result = "";
    if (bearer == "access-token") {
      result = verifyToken({
        token,
        secretKey: process.env.secretKeyAccessToken,
      });
    }
    if (result.message) {
      return next(new AppError(result.message, 401));
    }
    // check user
    const user = await User.findOne({
      email: result.email,
      status: status.VERIFIED,
    }).select("-password");
    if (!user) {
      return next(new AppError(messages.user.notFound, 404));
    }
    if (!user.active) {
      return next(new AppError("please login", 401));
    }
    req.authUser = user;
    next();
  };
};
