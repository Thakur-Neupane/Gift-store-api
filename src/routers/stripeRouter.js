import express from "express";
import Stripe from "stripe";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { couponApplied } = req.body;
    console.log(req.body);

    // Fetch user and cart details from the database
    const user = await User.findOne({ email: req.user.email }).exec();
    if (!user) return res.status(404).json({ error: "User not found" });

    const cart = await Cart.findOne({ orderdBy: user._id }).exec();
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const { cartTotal, totalAfterDiscount } = cart;
    const finalAmount =
      couponApplied && totalAfterDiscount
        ? totalAfterDiscount * 100
        : cartTotal * 100;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
    });

    console.log("Payment Intent Created:", paymentIntent); // Debugging

    res.json({
      clientSecret: paymentIntent.client_secret,
      cartTotal,
      totalAfterDiscount,
      payable: finalAmount,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error); // Detailed error logging
    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

export default router;
