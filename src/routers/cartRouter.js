import express from "express";
import Cart from "../models/cart/cartSchema.js"; // Adjust the path if needed
import User from "../models/user/UserSchema.js"; // Adjust the path if needed
import Product from "../models/product/ProductSchema.js"; // Adjust the path if needed

const router = express.Router();

// Create or update cart
router.post("/", async (req, res, next) => {
  try {
    const { items, total, userId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        status: "error",
        message: "Cart cannot be empty",
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.product || !item.count || !item.color || !item.price) {
        return res.status(400).json({
          status: "error",
          message: "Invalid item format",
        });
      }
    }

    // Find the user based on userId
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Remove any existing cart for the user
    await Cart.findOneAndDelete({ orderedBy: user._id }).exec();

    // Create a new cart
    let newCart = new Cart({
      products: items,
      cartTotal: total,
      orderedBy: user._id,
    });

    await newCart.save();

    res.json({
      status: "success",
      message: "Cart created successfully",
      cart: newCart,
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
      .populate("products.Product")
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
