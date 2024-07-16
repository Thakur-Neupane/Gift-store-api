import mongoose from "mongoose";
const subCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Name is required.",
      minlength: [3, "Too Short"],
      maxlength: [32, "Too Long"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    status: { type: String, default: "inactive" },

    parent: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("subCategory", subCategorySchema); //categories
