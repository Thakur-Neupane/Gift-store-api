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
          min: 1,
        },
        color: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
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
      min: 0,
    },
    totalAfterDiscount: {
      type: Number,
      default: 0,
      min: 0,
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
      phoneNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return /\+?[0-9]{7,15}/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
      message: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure cart total remains accurate
cartSchema.pre("save", function (next) {
  this.cartTotal = this.products.reduce(
    (total, item) => total + item.count * item.price,
    0
  );
  if (this.totalAfterDiscount > this.cartTotal) {
    this.totalAfterDiscount = this.cartTotal;
  }
  next();
});

export default mongoose.model("Cart", cartSchema);
