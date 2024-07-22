import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "active",
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
    },
    sku: {
      type: String,
      unique: [
        true,
        "This SKU has been already used for the another product, please use different SKU",
      ],
      required: true,
    },
    category: {
      // Adjusted field name to match 'parentCatId'
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    salesPrice: {
      type: Number,
      default: null,
    },
    salesStart: {
      type: Date,
      default: null,
    },
    salesEnd: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      text: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    subCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    shipping: {
      type: String,
      enum: ["Yes", "No"],
    },
    color: {
      type: String,
    },
    brand: {
      type: String,
    },

    // images: [
    //   {
    //     type: String,
    //   },
    // ],
    // ratings: [
    //   {
    //     star: Number,
    //     postedBy: {
    //       type: mongoose.Types.ObjectId,
    //       ref: "User",
    //     },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema); //Product schema
