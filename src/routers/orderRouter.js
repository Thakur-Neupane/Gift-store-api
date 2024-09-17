import express from "express";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";
import Order from "../models/orders/orderSchema.js";

const router = express.Router();

router.post("/createOrder", async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body;

    // Find the user
    const user = await User.findById(userId).exec();
    if (!user) {
      console.error("User not found:", userId);
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Find and empty the user's cart
    const cart = await Cart.findOneAndDelete({ orderedBy: user._id }).exec();
    if (!cart) {
      console.error("Cart not found for user:", userId);
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    }

    // Create a new order
    const newOrder = new Order({
      products: cart.products,
      paymentIntent: paymentIntentId,
      orderedBy: user._id,
    });

    await newOrder.save();
    console.log("Order saved successfully:", newOrder);

    res.json({ ok: true });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create order" });
  }
});

export default router;
