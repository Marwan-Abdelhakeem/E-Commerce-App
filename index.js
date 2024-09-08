// import modules
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";
import { AppError, globalErrorHandling } from "./src/utils/index.js";
import * as allRouters from "./src/index.js";
import { bootstrap } from "./src/modules/bootstrap.js";
process.on("uncaughtException", () => console.log("error"));
dotenv.config({ path: path.resolve("./config/.env") });
//create server
const app = express();
const port = +process.env.PORT || 3000;
//connect to db
connectDB();
// webhook
app.use("/webhook", allRouters.orderRouter);
//parse req
app.use(express.json());
bootstrap(app);
// not found error handling
app.use("*", (req, res, next) => {
  next(new AppError(`${req.method} ${req.originalUrl} not found`, 404));
});
// globalErrorHandling
app.use(globalErrorHandling);
//listen server
app.listen(port, () => {
  console.log("server is running on port", port);
});
process.on("uncaughtException", () => console.log("error"));
