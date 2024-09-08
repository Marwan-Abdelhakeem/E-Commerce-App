// import modules
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./db/connection.js";
import { Cart, Order, Product } from "./db/index.js";
import * as allRouters from "./src/index.js";
import {
  AppError,
  asyncHandler,
  globalErrorHandling,
} from "./src/utils/index.js";

process.on("uncaughtException", () => console.log("error"));
dotenv.config({ path: path.resolve("./config/.env") });
//create server
const app = express();
const port = +process.env.PORT || 3000;
//connect to db
connectDB();
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   asyncHandler(async (req, res) => {
//     const sig = req.headers["stripe-signature"].toString();
//     let event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.StripeEndpointSecret
//     ); // endpointSecret
//     // Handle the event
//     if (event.type == "checkout.session.completed") {
//       const checkout = event.data.object;
//       const orderId = checkout.metaData.orderId;
//       // update order status placed
//       const orderExist = await Order.findByIdAndUpdate(
//         orderId,
//         {
//           status: "placed",
//         },
//         { new: true }
//       );
//       // clear cart
//       await Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] });
//       // update product stock
//       for (const product of orderExist.products) {
//         await Product.findByIdAndUpdate(product.productId, {
//           $inc: { stock: -product.quantity },
//         });
//       }
//     }
//     // Return a 200 res to acknowledge receipt of the event
//     res.send();
//   })
// );

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"].toString();
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.StripeEndpointSecret
        );
      } catch (err) {
        console.error("Error verifying Stripe signature:", err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      if (event.type === "checkout.session.completed") {
        const checkout = event.data.object;
        const orderId = checkout.metadata.orderId; // احرص أن يكون metaData صحيحًا

        console.log("Checkout session completed for orderId:", orderId);

        // update order status placed
        const orderExist = await Order.findByIdAndUpdate(
          orderId,
          { status: "placed" },
          { new: true }
        );

        if (!orderExist) {
          console.error("Order not found:", orderId);
          return res.status(404).send("Order not found");
        }

        console.log("Order found and updated:", orderExist);

        // clear cart
        await Cart.findOneAndUpdate(
          { user: orderExist.user },
          { products: [] }
        );
        console.log("Cart cleared for user:", orderExist.user);

        // update product stock
        for (const product of orderExist.products) {
          await Product.findByIdAndUpdate(product.productId, {
            $inc: { stock: -product.quantity },
          });
          console.log(`Stock updated for product ${product.productId}`);
        }
      }

      // Return a 200 response to acknowledge receipt of the event
      res.status(200).send("Webhook received");
    } catch (err) {
      console.error("Error handling webhook event:", err);
      res.status(500).send("Internal Server Error");
    }
  })
);

//parse req
app.use(express.json());
app.use("/category", allRouters.categoryRouter);
app.use("/sub-category", allRouters.subcategoryRouter);
app.use("/brand", allRouters.brandRouter);
app.use("/product", allRouters.productRouter);
app.use("/auth", allRouters.authRouter);
app.use("/review", allRouters.reviewRouter);
app.use("/wishlist", allRouters.wishlistRouter);
app.use("/cart", allRouters.cartRouter);
app.use("/coupon", allRouters.couponRouter);
app.use("/order", allRouters.orderRouter);

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
