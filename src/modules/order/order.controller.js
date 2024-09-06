import { Cart, Coupon, Order, Product } from "../../../db/index.js";
import { AppError, couponTypes, messages } from "../../utils/index.js";

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
    orderPrice += productExist.finalPrice * product.quantity;
    orderProducts.push({
      name: productExist.name,
      productId: productExist._id,
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
  const createdOrder = await order.save();
  return res.status(201).json({
    message: messages.order.createdSuccessfully,
    success: true,
    data: createdOrder,
  });
};
