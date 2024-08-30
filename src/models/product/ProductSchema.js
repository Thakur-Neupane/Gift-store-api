import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "active",
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    salesPrice: {
      type: Number,
    },
    salesStart: {
      type: Date,
    },
    salesEnd: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    shipping: {
      type: String,
    },
    color: {
      type: [String], // Array of strings to represent colors
      validate: {
        validator: (v) => !v || (Array.isArray(v) && v.length > 0),
        message:
          "If provided, colors must be an array with at least one color.",
      },
      // No 'required' property here, making 'colors' optional
    },
    brand: {
      type: String,
    },

    ratings: [
      {
        star: {
          type: Number,
          min: 1,
          max: 5,
        },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        review: String,
      },
    ],
  },
  { timestamps: true }
);

// Add a text index on `name` and `description` fields
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
