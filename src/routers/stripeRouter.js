import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY, { apiVersion: "2020-08-27" }); // Ensure to use the correct Stripe API version

// Helper function to calculate cart total
const calculateCartTotal = (cart) => {
  if (cart && Array.isArray(cart.items)) {
    return cart.items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );
  }
  throw new Error("Invalid cart data");
};

// Helper function to validate coupon
const validateCoupon = (coupon) => {
  // For simplicity, assume all coupons are 10% off
  // You can replace this with actual coupon validation logic
  return coupon === "DISCOUNT10";
};

// Main route to create payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, cart, couponApplied } = req.body;

    // Log incoming request
    console.log("Received request data:", { userId, cart, couponApplied });

    if (!userId || !cart) {
      return res
        .status(400)
        .json({ error: "User ID and cart data are required" });
    }

    // Fetch user from the database
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate cart totals
    const cartTotal = calculateCartTotal(cart);

    // Apply discount if applicable
    const discount = validateCoupon(couponApplied) ? 0.1 : 0; // 10% discount
    const totalAfterDiscount = cartTotal * (1 - discount);
    const finalAmount = Math.round(totalAfterDiscount * 100); // Stripe requires amount in cents

    // Log calculated values
    console.log("Calculated values:", {
      cartTotal,
      discount,
      totalAfterDiscount,
      finalAmount,
    });

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
    });

    // Respond with payment intent details
    res.json({
      clientSecret: paymentIntent.client_secret,
      cartTotal,
      discount,
      totalAfterDiscount,
      payable: finalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res
      .status(500)
      .json({
        error: "Failed to create payment intent",
        details: error.message,
      });
  }
});

export default router;
