import { model, Schema } from "mongoose";
import { roles, status } from "../../src/utils/constant/enums.js";

// schema
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.PENDING,
    },
    active: {
      type: Boolean,
      default: false,
    },
    DOB: Date,
    image: {
      secure_url: {
        type: String,
        default:
          "https://res.cloudinary.com/dxyhgxd3j/image/upload/v1723851990/user_rhqrfo.webp",
      },
      public_id: { type: String, default: "user_rhqrfo" },
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
// model
export const User = model("User", userSchema);
