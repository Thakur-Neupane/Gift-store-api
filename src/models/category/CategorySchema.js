import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Name is required.",
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    status: { type: String, default: "inactive" },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema); //categories
