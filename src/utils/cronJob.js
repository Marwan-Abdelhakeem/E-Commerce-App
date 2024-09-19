import { Coupon, User } from "../../db/index.js";
import cloudinary from "./cloudinary.js";

export const cronJob = async () => {
  // Deleted accounts that have not been recovered within 3 months
  const users = await User.find({
    isDeleted: true,
    updatedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 },
  });
  if (users.length > 0) {
    // delete related images
    let userIds = [];
    for (const user of users) {
      if (user.image.public_id !== "user_rhqrfo") {
        await cloudinary.uploader.destroy(user.image.public_id);
      }
      userIds.push(user._id);
    }
    // delete related document
    await User.deleteMany({ _id: { $in: userIds } });
  }
  console.log(`${users.length} users have been deleted.`);
  // delete old coupons
  const coupons = await Coupon.deleteMany({ toDate: { $lt: Date.now() } });
  console.log(`${coupons.deletedCount} coupons have been deleted.`);
};
