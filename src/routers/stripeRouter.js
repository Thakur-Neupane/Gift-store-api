import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, cart, couponApplied } = req.body;

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
    let cartTotal = 0;
    if (cart && Array.isArray(cart.products)) {
      cartTotal = cart.products.reduce(
        (acc, product) => acc + (product.price || 0) * (product.count || 0),
        0
      );
    } else {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    // Apply discount if applicable
    const totalAfterDiscount = couponApplied ? cartTotal * 0.9 : cartTotal;
    const finalAmount = Math.round(totalAfterDiscount * 100);

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
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

export default router;
