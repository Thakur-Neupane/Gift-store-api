import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, couponApplied } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user from the database
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch cart details from the database using Cart model
    const cart = await Cart.findOne({ user: userId }).exec();
    if (!cart || !Array.isArray(cart.items)) {
      return res.status(400).json({ error: "Invalid or empty cart data" });
    }

    // Calculate cart totals
    let cartTotal = 0;
    let totalAfterDiscount = 0;

    cartTotal = cart.items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Apply discount if coupon is available
    totalAfterDiscount = couponApplied ? cartTotal * 0.9 : cartTotal;

    // Calculate final amount
    const finalAmount = Math.round(totalAfterDiscount * 100); // Amount in cents

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
    });

    // Respond with payment intent details
    res.json({
      clientSecret: paymentIntent.client_secret,
      cartTotal,
      totalAfterDiscount,
      payable: finalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

export default router;
