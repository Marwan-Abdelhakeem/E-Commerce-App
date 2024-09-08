import { Cart, Product } from "../../../db/index.js";
import { AppError, messages } from "../../utils/index.js";

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound, 404));
  }
  if (!productExist.inStock(quantity)) {
    return next(new AppError("out of stock", 409));
  }
  let data = 1;
  const productInCart = await Cart.findOneAndUpdate(
    { user: req.authUser._id, "products.productId": productId },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );
  let message = messages.cart.updatedSuccessfully;
  data = productInCart;
  if (!productInCart) {
    const cart = await Cart.findOneAndUpdate(
      { user: req.authUser._id },
      { $push: { products: { productId, quantity } } },
      { new: true }
    );
    message = "product added to cart";
    data = cart;
  }
  return res.status(200).json({ message, success: true, data });
};
export const removeFromCart = async (req, res, next) => {
  const { productId } = req.params;

  const productInCart = await Cart.findOneAndUpdate(
    { user: req.authUser._id, "products.productId": productId },
    { $pull: { products: { productId } } },
    { new: true }
  );

  if (!productInCart) {
    return next(new AppError(`${messages.product.notFound} in cart`, 404));
  }

  return res.status(200).json({
    message: "Product removed from cart",
    success: true,
    data: productInCart,
  });
};
export const getCart = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.authUser._id });
  return res.status(200).json({
    success: true,
    data: cart,
  });
};
