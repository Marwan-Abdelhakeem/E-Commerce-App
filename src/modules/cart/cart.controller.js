import { Cart, Product } from "../../../db/index.js";
import { AppError, messages } from "../../utils/index.js";

export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound));
  }
  if (productExist.stock < quantity) {
    return next(new AppError("out of stock", 409));
  }
  let data = "";
  const productInCart = await Cart.findByIdAndUpdate(
    { user: req.authUser._id, "products.productId": productId },
    { $set: { "products.$.quantity": quantity }, new: true }
  );
  let message = messages.cart.updatedSuccessfully;
  data = productInCart;
  if (!productInCart) {
    const cart = await Cart.findByIdAndUpdate(
      { user: req.authUser._id },
      { $push: { products: { productId, quantity } }, new: true }
    );
    message = "product added to cart";
    data = cart;
  }
  ``;
  return res.status(200).json({ message, success: true, data });
};
