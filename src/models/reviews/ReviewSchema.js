import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    // userName: {
    //   type: String,
    //   required: true,
    // },
    title: {
      type: String,
      required: true,
    },
    rating: {
      // Adjusted field name to match payload
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    description: {
      // Adjusted field name to match payload
      type: String,
      required: true,
    },
    productId: {
      // Added field to match payload
      type: mongoose.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Review", reviewSchema);
