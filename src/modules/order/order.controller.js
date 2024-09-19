import Stripe from "stripe";
import { Cart, Coupon, Order, Product } from "../../../db/index.js";
import {
  AppError,
  couponTypes,
  messages,
  paymentMethods,
} from "../../utils/index.js";

export const createOrder = async (req, res, next) => {
  const { phone, street, coupon, paymentMethod } = req.body;
  let couponExist = 0;
  if (coupon) {
    couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) {
      return next(new AppError(messages.coupon.notFound, 404));
    }
    if (couponExist.toDate < Date.now()) {
      return next(new AppError("coupon expired", 404));
    }
    // Check if the user is assigned to the coupon
    if (couponExist.assignedToUser.length > 0) {
      const userCoupon = couponExist.assignedToUser.find(
        (entry) => entry.user.toString() === req.authUser._id.toString()
      );
      if (!userCoupon) {
        return next(new AppError("Coupon not assigned to this user", 403));
      }
      if (userCoupon.userCount >= userCoupon.maxUse) {
        return next(new AppError("Coupon usage limit exceeded", 403));
      }
      // Update the userCount for this user
      userCoupon.userCount += 1;
      await couponExist.save();
    }
  }
  const cart = await Cart.findOne({ user: req.authUser._id });
  if (!cart.products.length) {
    return next(new AppError("cart is empty", 400));
  }
  const products = cart.products;
  let totalPriceBeforeDiscount = 0;
  let orderPrice = 0;
  let finalPrice = 0;
  let orderProducts = [];
  let discount = couponExist.discount;
  for (const product of products) {
    const productExist = await Product.findById(product.productId);
    if (!productExist) {
      return next(
        new AppError(`messages.product.notFound ${product.productId}`, 404)
      );
    }
    if (!productExist.inStock(product.quantity)) {
      return next(
        new AppError(`product ${productExist.name} is out of stock`, 400)
      );
    }
    const subImagesUrls = productExist.subImages.map(
      (image) => image.secure_url
    );
    const images = [productExist.mainImage.secure_url, ...subImagesUrls];

    let finalProductPrice = productExist.finalPrice;

    if (couponExist.couponType === couponTypes.PERCENTAGE) {
      finalProductPrice -= finalProductPrice * (couponExist.discount / 100);
      discount = `${couponExist.discount} %`;
    }
    totalPriceBeforeDiscount += productExist.finalPrice * product.quantity;
    orderPrice += finalProductPrice * product.quantity;

    orderProducts.push({
      name: productExist.name,
      productId: productExist._id,
      images,
      price: productExist.price,
      finalPrice: finalProductPrice,
      quantity: product.quantity,
      discount: productExist.discount,
    });
  }
  if (couponExist.couponType === couponTypes.FIXEDAMOUNT) {
    orderPrice -= couponExist.discount;
    discount = `${couponExist.discount} $`;
  }
  finalPrice = orderPrice;

  const order = new Order({
    user: req.authUser._id,
    address: { phone, street },
    coupon: {
      couponId: couponExist._id,
      code: coupon,
      discount,
    },
    paymentMethod,
    products: orderProducts,
    orderPrice: totalPriceBeforeDiscount,
    finalPrice,
  });
  // add to db
  const createdOrder = await order.save();
  // integrate with payment gateway
  if (paymentMethod == paymentMethods.VISA) {
    const stripe = new Stripe(process.env.StripeAPIkeys);
    const checkout = await stripe.checkout.sessions.create({
      success_url:
        "https://res.cloudinary.com/dxyhgxd3j/image/upload/v1725750181/Paymentsuccessful21_wc5bpo.png",
      cancel_url:
        "https://res.cloudinary.com/dxyhgxd3j/image/upload/v1725750183/Paymentfailedforweb_xrx0dn.png",
      payment_method_types: ["card"],
      mode: "payment", //Payment type: subscription or payment
      metadata: {
        orderId: createdOrder._id.toString(),
      },
      line_items: createdOrder.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              images: product.images,
            },
            unit_amount: product.finalPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
    });
    return res.status(201).json({
      message: messages.order.createdSuccessfully,
      success: true,
      data: createdOrder,
      url: checkout.url,
    });
  }
  return res.status(201).json({
    message: messages.order.createdSuccessfully,
    success: true,
    data: createdOrder,
  });
};

export const getAllOrdersFromUser = async (req, res, next) => {
  const orders = await Order.find({ user: req.authUser._id });
  if (orders.length === 0) {
    return res.status(200).json({
      message: "No orders for this user yet.",
      success: true,
      data: [],
    });
  }
  return res.status(200).json({
    success: true,
    data: orders,
  });
};

export const CheckoutSessionCompleted = async (req, res) => {
  const sig = req.headers["stripe-signature"].toString();
  let event = Stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.StripeEndpointSecret
  );
  // Handle the event
  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object;
    const orderId = checkout.metadata.orderId;
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
    await Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] });
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
};
