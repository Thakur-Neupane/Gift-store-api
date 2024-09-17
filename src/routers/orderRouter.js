import express from "express";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";
import Order from "../models/orders/orderSchema.js";

const router = express.Router();

router.post("/createOrder", async (req, res, next) => {
  const { paymentIntent } = req.body.stripeResponse;

  // Find the user
  const user = await User.findById(userId).exec();
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

  let newOrder = await new Order({
    products,
    paymentIntent,
    orderedBy: user._id,
  }).save();

  res.json({ ok: true });
});
export default router;
