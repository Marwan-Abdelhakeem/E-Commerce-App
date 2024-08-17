//import modules
import mongoose from "mongoose";
export const connectDB = () => {
  return mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("db connected successfully"))
    .catch((err) => {
      console.log("field to connect to db");
    });
};
