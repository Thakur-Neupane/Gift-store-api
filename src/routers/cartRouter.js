import express from "express";
import Cart from "../models/cart/cartSchema.js"; // Adjust the path if needed
import User from "../models/user/UserSchema.js"; // Adjust the path if needed
import Product from "../models/product/ProductSchema.js"; // Adjust the path if needed

const router = express.Router();

// Create or update cart
router.post("/", async (req, res, next) => {
  try {
    const { cart } = req.body; // Assume cart is an array of product objects
    if (!cart || !cart.length) {
      return res.status(400).json({
        status: "error",
        message: "Cart cannot be empty",
      });
    }

    // Find the user based on the email from the request
    const user = await User.findOne({ email: req.user.email }).exec();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if cart with the logged-in user ID already exists
    let cartExistByThisUser = await Cart.findOne({
      orderedBy: user._id,
    }).exec();

    if (cartExistByThisUser) {
      await cartExistByThisUser.remove();
      console.log("Removed old cart");
    }

    // Prepare products array with product details and calculate cartTotal
    let products = [];
    let cartTotal = 0;

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;

      // Get price for calculating total
      let product = await Product.findById(cart[i]._id).select("price").exec();
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: `Product with ID ${cart[i]._id} not found`,
        });
      }

      object.price = product.price;
      products.push(object);

      cartTotal += product.price * cart[i].count;
    }

    // Create new cart
    let newCart = new Cart({
      products,
      cartTotal,
      orderedBy: user._id,
    });

    await newCart.save();
    console.log("New cart", newCart);

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
