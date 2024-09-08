// server/stripeRouter.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to smallest currency unit
      currency,
      payment_method_types: [paymentMethod],
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

export default router;
