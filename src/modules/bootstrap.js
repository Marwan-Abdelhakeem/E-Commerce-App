import * as allRouters from "../index.js";
export const bootstrap = (app) => {
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
};
