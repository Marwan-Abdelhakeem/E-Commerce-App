import express, { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/authorization.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { cerateOrderVal } from "./order.validation.js";
import {
  CheckoutSessionCompleted,
  createOrder,
  getAllOrdersFromUser,
} from "./order.controller.js";

const orderRouter = Router();
orderRouter.post(
  "/create",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  isValid(cerateOrderVal),
  asyncHandler(createOrder)
);

// get All orders from user
orderRouter.get(
  "/my-orders",
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  asyncHandler(getAllOrdersFromUser)
);

orderRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  asyncHandler(CheckoutSessionCompleted)
);

export default orderRouter;
