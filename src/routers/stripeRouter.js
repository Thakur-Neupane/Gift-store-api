import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// Route to create a Stripe payment intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { couponApplied } = req.body;

    // 1. Find the user
    const user = await User.findOne({ email: req.user.email }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Get user cart total
    const cart = await Cart.findOne({ orderdBy: user._id }).exec();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const { cartTotal, totalAfterDiscount } = cart;

    // 3. Calculate the final amount
    let finalAmount = 0;
    if (couponApplied && totalAfterDiscount) {
      finalAmount = totalAfterDiscount * 100; // Convert to smallest currency unit
    } else {
      finalAmount = cartTotal * 100; // Convert to smallest currency unit
    }

    // 4. Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd", // Ensure this matches your currency
    });

    // 5. Send the client secret and other details back to the client
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
      message: "Something went wrong",
    });
  }
});

export default router;
