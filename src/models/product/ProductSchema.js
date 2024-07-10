import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "inactive",
    },

    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      index: 1,
      required: true,
    },

    sku: {
      type: String,
      unique: [
        true,
        "This SKU has been already used for the another product, please use different SKU",
      ],
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salesPrice: {
      type: Number,
      default: null,
    },
    salesStart: {
      type: Date,
      default: "",
    },
    salesEnd: {
      type: Date,
      default: "",
    },
    parentCatId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema); //productSchema
