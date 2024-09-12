import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js"; // Assuming you might need this later

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// Utility function to calculate discount
const applyDiscount = (amount, discountPercentage) =>
  amount * (1 - discountPercentage / 100);

// Endpoint to create a payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, cart, couponApplied } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user from the database
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate cart
    if (!cart || !Array.isArray(cart.items)) {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    // Calculate cart totals
    const cartTotal = cart.items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Apply discount if needed
    const discountPercentage = couponApplied ? 10 : 0; // Example: 10% discount
    const totalAfterDiscount = applyDiscount(cartTotal, discountPercentage);

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
      message: "Internal Server Error",
    });
  }
});

export default router;
