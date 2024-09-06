import { model, Schema } from "mongoose";

//schema
const subcategorySchema = new Schema(
  {
    name: String,
    slug: String,
    image: Object,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

subcategorySchema.virtual("categories", {
  localField: "category",
  foreignField: "_id",
  ref: "Category",
});

subcategorySchema.virtual("products", {
  localField: "_id",
  foreignField: "Subcategory",
  ref: "Product",
});
//model
export const Subcategory = model("Subcategory", subcategorySchema);
