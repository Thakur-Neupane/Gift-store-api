import express from "express";
import Stripe from "stripe";

import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";
import Coupon from "../models/coupon/couponSchema.js";

const router = express.Router();
const stripe = new Stripe(process.env.SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, couponApplied } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user from the database
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch cart from the database
    const cart = await Cart.findOne({ orderedBy: user._id })
      .populate("products.product", "_id title price")
      .exec();

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Ensure cartTotal is a number
    let cartTotal = parseFloat(cart.cartTotal);
    let totalAfterDiscount = cartTotal;

    if (couponApplied) {
      // Find the coupon
      const coupon = await Coupon.findOne({ name: couponApplied }).exec();
      if (coupon) {
        // Apply the discount
        const discountAmount = (cartTotal * coupon.discount) / 100;
        totalAfterDiscount = cartTotal - discountAmount;
      } else {
        return res.status(400).json({ error: "Invalid coupon code" });
      }
    }

    // Ensure totalAfterDiscount is not negative
    totalAfterDiscount = Math.max(totalAfterDiscount, 0);

    // Convert totalAfterDiscount to cents for Stripe
    const finalAmount = Math.round(totalAfterDiscount * 100);
    console.log(`Final amount in cents: ${finalAmount}`);

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
