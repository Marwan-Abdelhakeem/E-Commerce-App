// import modules
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";
import { AppError, cronJob, globalErrorHandling } from "./src/utils/index.js";
import * as allRouters from "./src/index.js";
import { bootstrap } from "./src/modules/bootstrap.js";
import { scheduleJob } from "node-schedule";
process.on("uncaughtException", () => console.log("error"));
dotenv.config({ path: path.resolve("./config/.env") });
//create server
const app = express();
const port = +process.env.PORT || 3000;
//connect to db
connectDB();
// Route for the homepage ("/")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/views", "welcome.html")); // Welcome page
});
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
// cron job
scheduleJob("0 1 * * *", cronJob);
//listen server
app.listen(port, () => {
  console.log("server is running on port", port);
});
process.on("uncaughtException", () => console.log("error"));
