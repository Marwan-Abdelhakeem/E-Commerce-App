import { Product, Review } from "../../../db/index.js";
import { roles } from "../../utils/constant/enums.js";
import { AppError, messages } from "../../utils/index.js";

// add review
export const addReview = async (req, res, next) => {
  const { productId, rate, comment } = req.body;
  // todo check user order this product
  const review = new Review({
    user: req.authUser._id,
    product: productId,
    rate,
    comment,
  });
  const createdReview = await review.save();
  // update product rate
  const rating = await Review.find({ product: productId }).select("rate");
  let avgRate = rating.reduce((acc, cur) => {
    return (acc += cur);
  }, 0);
  avgRate = avgRate / rating.length;
  await Product.findByIdAndUpdate(productId, { rate: avgRate });
  return res.status(201).json({
    message: messages.review.createdSuccessfully,
    success: true,
    data: { avgRate, rate },
  });
};

export const deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const reviewExist = await Review.findById(reviewId);
  if (!reviewExist) {
    return next(new AppError(messages.review.notFound, 404));
  }
  if (
    req.authUser._id.toString() != reviewExist.user.toString() &&
    req.authUser.role != roles.ADMIN
  ) {
    return next(new AppError(messages.user.notAllowed, 401));
  }
  await Review.deleteOne({ _id: reviewId });
  return res
    .status(200)
    .json({ message: messages.review.deletedSuccessfully, success: true });
};
