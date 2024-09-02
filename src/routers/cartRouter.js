import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Product from "../models/product/ProductSchema.js";

const router = express.Router();

// Create or update cart
router.post("/", async (req, res, next) => {
  try {
    const { products, cartTotal, totalAfterDiscount, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ orderedBy: userId });

    if (cart) {
      // Update existing cart
      cart.products = products;
      cart.cartTotal = cartTotal;
      cart.totalAfterDiscount = totalAfterDiscount;
    } else {
      // Create new cart
      cart = new Cart({
        products,
        cartTotal,
        totalAfterDiscount,
        orderedBy: userId,
      });
    }

    await cart.save();
    res.json({
      status: "success",
      message: cart ? "Cart updated successfully" : "Cart created successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Get cart by user ID
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ orderedBy: userId })
      .populate("products.product")
      .exec();

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    res.json({
      status: "success",
      cart,
    });
  } catch (error) {
    next(error);
  }
});

// Delete cart by user ID
router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deletedCart = await Cart.findOneAndDelete({ orderedBy: userId });

    if (!deletedCart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    res.json({
      status: "success",
      message: "Cart deleted successfully",
      deletedCart,
    });
  } catch (error) {
    next(error);
  }
});

// Example route for clearing all carts (if needed)
router.delete("/", async (req, res, next) => {
  try {
    await Cart.deleteMany({});
    res.json({
      status: "success",
      message: "All carts have been cleared",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
