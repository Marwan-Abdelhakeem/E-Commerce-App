import { model, Schema } from "mongoose";
import { orderStatus, paymentMethods } from "../../src/utils/index.js";

//schema
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        name: String,
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        images: [String],
        quantity: { type: Number, default: 1 },
        price: Number,
        finalPrice: Number,
        discount: Number,
      },
    ],
    address: {
      phone: String,
      street: String,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethods),
      default: paymentMethods.CASH,
    },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PLACED,
    },
    coupon: {
      couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
      code: String,
      discount: String,
    },
    orderPrice: Number,
    finalPrice: Number,
  },
  {
    timestamps: true,
  }
);
//model
export const Order = model("Order", orderSchema);
