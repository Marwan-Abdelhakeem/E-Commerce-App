import { model, Schema } from "mongoose";
import { couponTypes } from "../../src/utils/index.js";

const couponSchema = new Schema(
  {
    code: String,
    discount: Number,
    couponType: {
      type: String,
      enum: Object.values(couponTypes)[("fixedAmount", "percentage")],
      default: couponTypes.FIXEDAMOUNT,
    },
    toDate: {
      type: String,
      required: true,
    },
    assignedToUser: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        maxUse: { type: Number, max: 5 },
        userCount: Number,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export const Coupon = model("Coupon", couponSchema);
