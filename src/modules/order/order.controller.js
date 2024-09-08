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
  let totalPriceBeforeDiscount = 0;
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

    let finalProductPrice = productExist.finalPrice;
    let discount = couponExist.discount;
    if (couponExist.couponType === couponTypes.FIXEDAMOUNT) {
      finalProductPrice -= couponExist.discount / products.length;
      discount = `${couponExist.discount} $`;
    } else if (couponExist.couponType === couponTypes.PERCENTAGE) {
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

  finalPrice = orderPrice;

  const order = new Order({
    user: req.authUser._id,
    address: { phone, street },
    coupon: {
      couponId: couponExist._id,
      code: coupon,
      discount: couponExist.discount,
    },
    paymentMethod,
    products: orderProducts,
    orderPrice: totalPriceBeforeDiscount,
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
