import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Product from "../models/product/ProductSchema.js";

const router = express.Router();

// Create or update cart without address
router.post("/", async (req, res, next) => {
  try {
    const { items, total, userId, title } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        status: "error",
        message: "Cart cannot be empty",
      });
    }

    // Find the user
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Map items to the correct format
    const formattedItems = items.map((item) => ({
      product: item._id,
      count: item.count,
      color: item.color,
      price: item.price,
      title: item.title,
      size: item.size || undefined,
    }));

    // Remove existing cart for the user
    await Cart.findOneAndDelete({ orderedBy: user._id }).exec();

    // Create and save a new cart
    const newCart = new Cart({
      products: formattedItems,
      cartTotal: total,
      orderedBy: user._id,
      title: title,
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
      .populate("products.product", "_id name price")
      .exec();

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    res.json({ status: "success", cart });
  } catch (error) {
    next(error);
  }
});

router.put("/update-address/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const address = req.body;

    if (
      !address ||
      !address.unitNumber ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.country ||
      !address.phoneNumber
    ) {
      return res.status(400).json({
        status: "error",
        message: "Complete address is required",
      });
    }

    // Update cart with new address
    const cart = await Cart.findOneAndUpdate(
      { orderedBy: userId },
      { address },
      { new: true }
    ).exec();

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
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
