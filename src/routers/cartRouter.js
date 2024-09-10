import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Coupon from "../models/coupon/couponSchema.js"; // Import the Coupon model
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

// Update address for the cart
router.put("/update-address/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const address = req.body;

    // Validate address
    const requiredFields = [
      "unitNumber",
      "street",
      "city",
      "state",
      "zipCode",
      "country",
      "phoneNumber",
    ];
    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Complete address is required. Missing fields: ${missingFields.join(
          ", "
        )}`,
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

// Apply coupon to user cart
router.post("/apply-coupon", async (req, res) => {
  try {
    const { coupon, userId } = req.body;

    if (!coupon || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Coupon code and userId are required",
      });
    }

    // Find the coupon
    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (!validCoupon) {
      return res.status(400).json({
        status: "error",
        message: "Invalid coupon code",
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

    // Find the cart
    const cart = await Cart.findOne({ orderedBy: user._id })
      .populate("products.product", "_id title price")
      .exec();

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    const { cartTotal } = cart;

    // Calculate the total after discount
    const discountAmount = (cartTotal * validCoupon.discount) / 100;
    const totalAfterDiscount = (cartTotal - discountAmount).toFixed(2);

    // Update cart with the new total after discount
    const updatedCart = await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      { cartTotal: totalAfterDiscount },
      { new: true }
    ).exec();

    res.json({
      status: "success",
      totalAfterDiscount,
      cart: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
