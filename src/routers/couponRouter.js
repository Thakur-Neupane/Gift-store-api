import express from "express";
import Coupon from "../models/coupon/couponSchema.js";

const router = express.Router();

// Utility function to convert a string to uppercase
const toUpperCase = (str) => {
  if (!str) return str; // Handle empty or undefined strings
  return str.toUpperCase(); // Convert the entire string to uppercase
};

// Create a new coupon
router.post("/", async (req, res, next) => {
  const { name, expiry, discount } = req.body;

  if (!name || !expiry || !discount) {
    return res.status(400).json({
      status: "error",
      message: "Name, expiry, and discount are required fields",
    });
  }

  try {
    // Convert the name to uppercase
    const upperCaseName = toUpperCase(name);

    const newCoupon = new Coupon({ name: upperCaseName, expiry, discount });
    await newCoupon.save();

    res.status(201).json({
      status: "success",
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    next(error);
  }
});

// Remove a coupon by ID
router.delete("/:couponId", async (req, res, next) => {
  const { couponId } = req.params;

  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId).exec();

    if (!deletedCoupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    res.json({
      status: "success",
      message: "Coupon deleted successfully",
      deletedCoupon,
    });
  } catch (error) {
    next(error);
  }
});

// List all coupons
router.get("/", async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).exec();

    res.json({
      status: "success",
      coupons,
    });
  } catch (error) {
    next(error);
  }
});

// Update a coupon by ID
router.put("/:couponId", async (req, res, next) => {
  const { couponId } = req.params;
  const { name, expiry, discount } = req.body;

  if (!name && !expiry && !discount) {
    return res.status(400).json({
      status: "error",
      message:
        "At least one field (name, expiry, discount) is required to update",
    });
  }

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { name: toUpperCase(name), expiry, discount },
      { new: true }
    ).exec();

    if (!updatedCoupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    res.json({
      status: "success",
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    next(error);
  }
});

// Apply a coupon
router.post("/apply", async (req, res, next) => {
  const { coupon, cartTotal } = req.body;

  if (!coupon || cartTotal === undefined) {
    return res.status(400).json({
      status: "error",
      message: "Coupon code and cart total are required",
    });
  }

  try {
    const validCoupon = await Coupon.findOne({
      name: coupon.toUpperCase(),
    }).exec();

    if (!validCoupon) {
      return res.status(404).json({
        status: "error",
        message: "Coupon not found",
      });
    }

    // Calculate the discount
    const discountAmount = (cartTotal * (validCoupon.discount / 100)).toFixed(
      2
    );
    const totalAfterDiscount = (cartTotal - discountAmount).toFixed(2);

    res.json({
      status: "success",
      totalAfterDiscount,
      coupon: validCoupon,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
