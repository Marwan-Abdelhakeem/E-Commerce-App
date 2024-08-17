import { model, Schema } from "mongoose";

// schema
const productSchema = new Schema(
  {
    //===== name =====//
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    //===== related ids =====//
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    //===== images =====//
    mainImage: Object,
    subImages: [Object],
    //===== prices =====//
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    //===== properties =====//
    colors: [String],
    size: [String],
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// virtual
productSchema.virtual("finalPrice").get(function () {
  return this.price - this.price * ((this.discount || 0) / 100);
});
// model
export const Product = model("Product", productSchema);
