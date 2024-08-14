import express from "express";
const router = express.Router();
import slugify from "slugify";
import {
  getAllProducts,
  getOneProduct,
  insertProduct,
  deleteProduct,
  updateProduct,
} from "../models/product/ProductModel.js";

// Create a new product
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category,
      qty,
      price,
      salesPrice,
      salesStart,
      salesEnd,
      description,
      shipping,
      color,
      brand,
      subCategories,
      thumbnail,
    } = req.body;

    if (!name || !sku || !category || !qty || !price) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    const generatedSlug = slugify(name, { lower: true });
    const productSlug = req.body.slug || generatedSlug;

    const prod = await insertProduct({
      name,
      sku,
      slug: productSlug,
      category,
      qty,
      price,
      salesPrice,
      salesStart,
      salesEnd,
      description,
      thumbnail,
      shipping,
      color,
      brand,
      subCategories: subCategories || [],
    });

    if (prod?._id) {
      return res.json({
        status: "success",
        message: "New product has been added",
      });
    }

    res.json({
      status: "error",
      message: "Unable to add product, try again later",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This product slug or SKU already exists. Please change the name of the product or SKU and try again.";
      error.statusCode = 400;
    }
    next(error);
  }
});

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json({
      status: "success",
      message: "",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Get a single product by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await getOneProduct(slug);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      message: "",
      product,
    });
  } catch (error) {
    next(error);
  }
});

// Update a product by slug
router.put("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const updatedProduct = await updateProduct(slug, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a product by slug
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete route:", error.message);
    res.status(500).json({
      status: "error",
      message: "Error deleting product: " + error.message,
    });
  }
});

export default router;
