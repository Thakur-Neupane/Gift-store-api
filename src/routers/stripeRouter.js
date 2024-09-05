import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY);

// Route to create a Stripe payment intent
router.post("/create-stripe-payment", async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    // Create a payment intent with Stripe
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

// Route to confirm an order
router.post("/confirm-order", async (req, res) => {
  try {
    console.log(req.body);
    if (req.body.id) {
      return res.json({
        success: "true",
        message: "Order Saved",
      });
    } else {
      return res.status(400).json({
        success: "false",
        message: "Order ID is required",
      });
    }
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.status(500).json({
      success: "false",
      message: "Something went wrong",
    });
  }
});

export default router;
