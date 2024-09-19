import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Coupon from "../models/coupon/couponSchema.js"; // Import the Coupon model

const router = express.Router();

// Create or update cart with optional address
router.post("/", async (req, res, next) => {
  try {
    const { items, total, userId, title, address } = req.body;

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
      product: item.product, // Ensure it's the correct field
      count: item.count,
      color: item.color,
      price: item.price,
      title: item.title || undefined, // title may not be present
    }));

    // Remove existing cart for the user
    await Cart.findOneAndDelete({ orderedBy: user._id }).exec();

    // Create and save a new cart
    const newCart = new Cart({
      products: formattedItems,
      cartTotal: total,
      orderedBy: user._id,
      title: title,
      address: address || {},
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
    console.log(userId);

    // Find the cart associated with the given user ID
    const cart = await Cart.findOne({ orderedBy: userId })
      .populate("products.product", "_id name price") // Populate product details
      .exec();

    // If no cart is found, return a 404 error
    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    // Respond with the cart details
    res.json({
      status: "success",
      cart: {
        ...cart.toObject(), // Convert cart to a plain object to include virtual fields
        cartTotal: cart.cartTotal.toFixed(2), // Ensure total is formatted to two decimal places
      },
    });
  } catch (error) {
    // Pass errors to the error handler middleware
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

    // Validate input
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

    // Calculate the discount amount and total after discount
    const discountAmount = (cartTotal * validCoupon.discount) / 100;
    const totalAfterDiscount = cartTotal - discountAmount;

    // Update cart with the new total after discount
    const updatedCart = await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      {
        cartTotal: cartTotal, // Optionally update if necessary
        totalAfterDiscount: totalAfterDiscount.toFixed(2),
      },
      { new: true }
    ).exec();

    res.json({
      status: "success",
      totalAfterDiscount: totalAfterDiscount.toFixed(2),
      coupon: validCoupon,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
