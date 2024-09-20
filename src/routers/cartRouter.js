import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Coupon from "../models/coupon/couponSchema.js";

const router = express.Router();

// Create or update cart with optional address
router.post("/", async (req, res, next) => {
  try {
    const { items, total, userId, title, address } = req.body;

    // Validate input
    if (!items || !items.length) {
      return res.status(400).json({
        status: "error",
        message: "Cart cannot be empty",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Map items to the correct format
    const formattedItems = items.map((item) => ({
      product: item.product,
      count: item.count,
      color: item.color,
      price: item.price,
      title: item.title || undefined,
    }));

    // Remove existing cart for the user
    await Cart.findOneAndDelete({ orderedBy: user._id });

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

    // Find the cart associated with the given user ID
    const cart = await Cart.findOne({ orderedBy: userId })
      .populate("products.product", "_id name price")
      .exec();

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    res.json({
      status: "success",
      cart: {
        ...cart.toObject(),
        cartTotal: cart.cartTotal.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update address for the cart
router.put("/update-address/:userId", async (req, res, next) => {
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
    );

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

// Clear all carts
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
router.post("/apply-coupon", async (req, res, next) => {
  try {
    const { coupon, userId } = req.body;

    if (!coupon || !userId) {
      return res.status(400).json({
        status: "error",
        message: "Coupon code and userId are required",
      });
    }

    // Validate coupon
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      return res.status(400).json({
        status: "error",
        message: "Invalid coupon code",
      });
    }

    // Find the user and cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const cart = await Cart.findOne({ orderedBy: user._id }).populate(
      "products.product",
      "_id title price"
    );

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    // Calculate discount
    const discountAmount = (cart.cartTotal * validCoupon.discount) / 100;
    const totalAfterDiscount = cart.cartTotal - discountAmount;

    // Update cart with new total after discount
    const updatedCart = await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      {
        cartTotal: totalAfterDiscount.toFixed(2),
      },
      { new: true }
    );

    res.json({
      status: "success",
      totalAfterDiscount: totalAfterDiscount.toFixed(2),
      coupon: validCoupon,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
