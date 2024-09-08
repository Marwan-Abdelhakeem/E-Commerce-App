import { Order, Product, Review } from "../../../db/index.js";
import { AppError, messages, roles } from "../../utils/index.js";

// add review
export const addReview = async (req, res, next) => {
  const { productId, rate, comment } = req.body;
  // check user order this product
  const orderExist = await Order.findOne({
    user: req.authUser._id,
    "products.productId": productId,
  });

  if (!orderExist) {
    return next(
      new AppError("You cannot review a product you haven't purchased", 400)
    );
  }
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
    return (acc += cur.rate);
  }, 0);
  avgRate = avgRate / rating.length;
  await Product.findByIdAndUpdate(productId, { rate: avgRate });
  return res.status(201).json({
    message: messages.review.createdSuccessfully,
    success: true,
    data: { avgRate, rate, createdReview },
  });
};

export const deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const reviewExist = await Review.findByIdAndDelete(reviewId);
  if (!reviewExist) {
    return next(new AppError(messages.review.notFound, 404));
  }
  if (
    req.authUser._id.toString() != reviewExist.user.toString() &&
    req.authUser.role != roles.ADMIN
  ) {
    return next(new AppError(messages.user.notAllowed, 401));
  }
  const rating = await Review.find({ product: reviewExist.product }).select(
    "rate"
  );
  let avgRate = rating.reduce((acc, cur) => {
    return (acc += cur.rate);
  }, 0);
  avgRate = avgRate / rating.length;
  await Product.findByIdAndUpdate(reviewExist.product, { rate: avgRate });
  await Review.findByIdAndDelete(reviewId);
  return res
    .status(200)
    .json({
      message: messages.review.deletedSuccessfully,
      success: true,
      data: { avgRate },
    });
};

export const getAllReviewsOfProduct = async (req, res, next) => {
  const { productId } = req.params;
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound, 404));
  }
  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "userName email"
  );

  if (reviews.length === 0) {
    return res.status(200).json({
      message: "No reviews for this product yet.",
      success: true,
      data: [],
    });
  }

  return res.status(200).json({
    message: "Reviews fetched successfully",
    success: true,
    data: reviews,
  });
};

export const editReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { rate, comment } = req.body;
  const reviewExist = await Review.findById(reviewId);
  if (!reviewExist) {
    return next(new AppError(messages.review.notFound, 404));
  }
  if (
    req.authUser._id.toString() !== reviewExist.user.toString() &&
    req.authUser.role !== roles.ADMIN
  ) {
    return next(new AppError(messages.user.notAllowed, 401));
  }
  reviewExist.rate = rate !== undefined ? rate : reviewExist.rate;
  reviewExist.comment = comment !== undefined ? comment : reviewExist.comment;
  const updatedReview = await reviewExist.save();
  const allReviews = await Review.find({ product: reviewExist.product }).select(
    "rate"
  );
  let avgRate =
    allReviews.reduce((acc, cur) => acc + cur.rate, 0) / allReviews.length;
  await Product.findByIdAndUpdate(reviewExist.product, { rate: avgRate });
  return res.status(200).json({
    message: messages.review.updatedSuccessfully,
    success: true,
    data: { updatedReview, avgRate },
  });
};
