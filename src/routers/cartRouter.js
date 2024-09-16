import express from "express";
import Cart from "../models/cart/cartSchema.js";
import User from "../models/user/UserSchema.js";
import Coupon from "../models/coupon/couponSchema.js";

const router = express.Router();

// Helper function to validate address
const validateAddress = (address) => {
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
  return missingFields.length > 0
    ? { valid: false, missingFields }
    : { valid: true };
};

// Helper function to format cart items
const formatCartItems = (items) =>
  items.map((item) => ({
    product: item.product,
    count: item.count,
    color: item.color,
    price: item.price,
    title: item.title || undefined,
  }));

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

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const formattedItems = formatCartItems(items);

    await Cart.findOneAndDelete({ orderedBy: user._id }).exec();

    const newCart = new Cart({
      products: formattedItems,
      cartTotal: total,
      orderedBy: user._id,
      title: title || "",
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

    const { valid, missingFields } = validateAddress(address);
    if (!valid) {
      return res.status(400).json({
        status: "error",
        message: `Complete address is required. Missing fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

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

    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (!validCoupon) {
      return res.status(400).json({
        status: "error",
        message: "Invalid coupon code",
      });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

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
    const discountAmount = (cartTotal * validCoupon.discount) / 100;
    const totalAfterDiscount = cartTotal - discountAmount;

    const updatedCart = await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      { cartTotal, totalAfterDiscount: totalAfterDiscount.toFixed(2) },
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
