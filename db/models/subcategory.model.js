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
  { timestamps: true }
);
//model
export const Subcategory = model("Subcategory", subcategorySchema);
