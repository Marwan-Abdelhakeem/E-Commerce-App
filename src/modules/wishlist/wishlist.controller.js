import { User } from "../../../db/index.js";

export const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;
  const wishlist = await User.findByIdAndUpdate(
    req.authUser._id,
    {
      $addToSet: { wishlist: productId },
    },
    { new: true }
  );
  return res.status(200).json({
    message: `${productId} added to wishlist successfully`,
    success: true,
    data: wishlist,
  });
};

export const getWishlist = async (req, res, next) => {
  const user = await User.findById(
    req.authUser._id,
    { wishlist: 1 },
    { populate: "wishlist" }
  );
  return res.status(200).json({
    success: true,
    data: user,
  });
};

export const deleteFromWishlist = async (req, res, next) => {
  const { productId } = req.params;
  const wishlist = await User.findByIdAndUpdate(
    req.authUser._id,
    {
      $pull: { wishlist: productId },
    },
    { new: true }
  ).select("wishlist");
  return res.status(200).json({
    message: "product removed successfully",
    success: true,
    data: wishlist,
  });
};
