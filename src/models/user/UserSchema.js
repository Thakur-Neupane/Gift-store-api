import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "inactive",
    },

    role: {
      type: String,
      default: "user",
    },

    googleId: {
      type: String,
      default: null,
    },

    fName: {
      type: String,
      required: true,
      //    maxLength: [100, "stop spamming me"]
    },
    lName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      index: 1,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshJWT: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema); //users
