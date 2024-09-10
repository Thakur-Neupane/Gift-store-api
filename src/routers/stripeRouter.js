import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

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

    // Calculate cart totals
    let cartTotal = 0;
    let totalAfterDiscount = 0;
    if (cart && Array.isArray(cart.items)) {
      cartTotal = cart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      // Simulate discount application
      if (couponApplied) {
        // Implement your discount logic here
        totalAfterDiscount = cartTotal * 0.9; // Example: 10% discount
      } else {
        totalAfterDiscount = cartTotal;
      }
    } else {
      return res.status(400).json({ error: "Invalid cart data" });
    }

    // Calculate final amount
    const finalAmount = totalAfterDiscount * 100; // Amount in cents

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
