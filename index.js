// import modules
import express from "express";
import { connectDB } from "./db/connection.js";
import * as allRouters from "./src/index.js";
import { AppError, globalErrorHandling } from "./src/utils/index.js";

process.on("uncaughtException", () => console.log("error"));

//create server
const app = express();
const port = +process.env.PORT;
//connect to db
connectDB();
//parse req

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
