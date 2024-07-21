import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "inactive",
    },
    title: {
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
      unique: true,
      required: true,
      validate: {
        validator: async function (v) {
          const count = await this.model("Product").countDocuments({ sku: v });
          return count === 0;
        },
        message: (props) =>
          `The SKU '${props.value}' is already in use. Please choose a different SKU.`,
      },
    },
    category: {
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
    parentCatId: {
      type: mongoose.Types.ObjectId,
      required: true,
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
    images: {
      type: [String],
    },
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
