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
  }
  const cart = await Cart.findOne({ user: req.authUser._id });
  if (!cart.products.length) {
    return next(new AppError("cart is empty", 400));
  }
  const products = cart.products;
  let orderPrice = 0;
  let finalPrice = 0;
  let orderProducts = [];
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

    orderPrice += productExist.finalPrice * product.quantity;
    orderProducts.push({
      name: productExist.name,
      productId: productExist._id,
      images,
      price: productExist.price,
      finalPrice: productExist.finalPrice,
      quantity: product.quantity,
      discount: productExist.discount,
    });
  }
  let discount = couponExist.discount;
  couponExist.couponType == couponTypes.FIXEDAMOUNT
    ? ((finalPrice = orderPrice - discount), (discount = `${discount} $`))
    : couponExist.couponType == couponTypes.PERCENTAGE
    ? ((finalPrice = orderPrice - orderPrice * ((discount || 0) / 100)),
      (discount = `${discount} %`))
    : (finalPrice = orderPrice);

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
    orderPrice,
    finalPrice,
  });
  // add to db
  const createdOrder = await order.save();
  // integrate with payment gateway
  // todo add API keys .env
  if (paymentMethod == paymentMethods.VISA) {
    const stripe = new Stripe(
      "sk_test_51Pw7vlIuYceiim4n4I0g3QCGAorpxXQJhkAf9y3dx6mvmZO4zrJs0XWFGCjaLI51GQHyFy3n07JqJheynP4w4uLm00lcilPzXt"
    );
    const checkout = await stripe.checkout.sessions.create({
      success_url: "https://www.google.com",
      cancel_url: "https://www.facebook.com",
      payment_method_types: ["card"],
      mode: "payment", //Payment type: subscription or payment
      line_items: createdOrder.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              images: product.images,
            },
            unit_amount: product.price * 100,
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
