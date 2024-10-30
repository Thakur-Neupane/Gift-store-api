import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: [1, "Product count must be at least 1"],
        },
        color: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        size: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
      },
    ],
    cartTotal: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
      min: [0, "Discounted total cannot be negative"],
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      unitNumber: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      message: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Cart", cartSchema);
