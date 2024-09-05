import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: [true, "Name is required"],
      minlength: [3, "Name is too short"],
      maxlength: [12, "Name is too long"],
    },
    expiry: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    discount: {
      type: Number,
      required: [true, "Discount is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
