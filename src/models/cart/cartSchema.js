import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        count: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
        },
        title: {
          type: String,
        },
      },
    ],
    cartTotal: {
      type: Number,
      required: true,
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      unitNumber: { type: String },
      street: { type: String },
      city: { type: String }, x      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
      phoneNumber: { type: String },
      message: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
