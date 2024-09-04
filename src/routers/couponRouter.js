import express from "express";
import Coupon from "../models/coupon/couponSchema.js";

const router = express.Router();

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
    const newCoupon = new Coupon({ name, expiry, discount });
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

export default router;
