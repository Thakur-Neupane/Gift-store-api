import mongoose from "mongoose";

// Define a schema for the address with nested validation
const addressSchema = new mongoose.Schema(
  {
    unitNumber: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: {
      type: String,
      required: true,
      match: /^[0-9]{5}(-[0-9]{4})?$/,
      trim: true,
    },
    country: { type: String, required: true, trim: true },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[0-9-+()]{7,20}$/,
      trim: true,
    },
    message: { type: String, maxlength: 500, trim: true },
  },
  { _id: false }
);

// Define a schema for each product in the cart
const cartProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    count: {
      type: Number,
      required: true,
      min: [1, "Count must be at least 1"],
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
  { _id: false }
);

// Define the main cart schema
const cartSchema = new mongoose.Schema(
  {
    products: [cartProductSchema],
    cartTotal: {
      type: Number,
      required: true,
      min: [0, "Cart total cannot be negative"],
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
      min: [0, "Total after discount cannot be negative"],
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    address: addressSchema,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
