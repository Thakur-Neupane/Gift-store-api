import express from "express";
import mongoose from "mongoose";
import User from "../models/user/UserSchema.js";
import Cart from "../models/cart/cartSchema.js";
import Order from "../models/orders/orderSchema.js";
import Product from "../models/product/ProductSchema.js";

const router = express.Router();

router.post("/createOrder", async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body;

    // Ensure user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID:", userId);
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID" });
    }

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

    console.log("Cart products:", cart.products);

    // Check if products in the cart exist in the database
    const productIds = cart.products.map((item) => item.product._id);
    const existingProducts = await Product.find({
      _id: { $in: productIds },
    }).exec();

    console.log("Product IDs from Cart:", productIds);
    console.log(
      "Existing Products in DB:",
      existingProducts.map((p) => p._id.toString())
    );

    // Log missing products
    const existingProductIds = existingProducts.map((p) => p._id.toString());
    const missingProductIds = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );
    if (missingProductIds.length > 0) {
      console.error("Products not found in DB:", missingProductIds);
    }

    // Create a new order
    const newOrder = new Order({
      products: cart.products,
      paymentIntent: paymentIntentId,
      orderedBy: user._id,
    });

    await newOrder.save();
    console.log("Order saved successfully:", newOrder);

    // Prepare bulk update operations
    const bulkOption = cart.products.map((item) => {
      const productId = item.product._id; // No need for ObjectId conversion if already an ObjectId
      return {
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { quantity: -item.count, sold: item.count } },
        },
      };
    });

    console.log("Bulk operations:", bulkOption);

    // Perform bulk write operation
    const result = await Product.bulkWrite(bulkOption);
    console.log("Bulk write result:", result);

    if (result.modifiedCount === 0) {
      console.warn("No documents were updated.");
    } else {
      console.log("Documents updated:", result.modifiedCount);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create order" });
  }
});

export default router;
