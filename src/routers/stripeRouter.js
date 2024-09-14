import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, cart, couponApplied } = req.body;

    if (!userId || !cart) {
      return res
        .status(400)
        .json({ error: "User ID and cart data are required" });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let cartTotal = 0;
    let totalAfterDiscount = 0;

    if (Array.isArray(cart.items)) {
      cartTotal = cart.items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      );

      // Simulate discount application
      totalAfterDiscount = couponApplied ? cartTotal * 0.9 : cartTotal;
    } else {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    const finalAmount = Math.round(totalAfterDiscount * 100); // Amount in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
    });

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
