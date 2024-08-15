import express from "express";
const router = express.Router();
import slugify from "slugify";
import ProductSchema from "../models/product/ProductSchema.js";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "../models/product/ProductModel.js";
import cloudinary from "cloudinary";
import Product from "../models/product/ProductSchema.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route to handle image uploads
router.post("/uploadimages", async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: "No images data provided" });
    }

    const uploadPromises = images.map((image) =>
      cloudinary.v2.uploader.upload(image, {
        folder: "product_images",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png"],
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    res.json(uploadedImages);
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Image upload failed", error });
  }
});

// Route to handle image removal
router.post("/removeimages", async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "Public ID is required" });
    }

    const result = await cloudinary.v2.uploader.destroy(public_id);

    if (result.result === "ok") {
      res.json({ message: "Image removed successfully" });
    } else {
      res.status(500).json({ message: "Image removal failed" });
    }
  } catch (error) {
    console.error("Image remove error:", error);
    res.status(500).json({ message: "Image removal failed", error });
  }
});

// Route to create a new product
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
      images,
    } = req.body;

    if (!name || !sku || !category || !qty || !price) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    const generatedSlug = slugify(name, { lower: true });
    const productSlug = req.body.slug || generatedSlug;

    // Create the product
    const prod = await Product.create({
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
      images,
      shipping,
      color,
      brand,
      subCategories: subCategories || [],
    });

    if (prod?._id) {
      return res.json({
        status: "success",
        message: "New product has been added",
        data: prod,
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

// Get a single product by _id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("Received ID in route:", id);
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID parameter is missing",
      });
    }

    const product = await ProductSchema.findById(id);
    console.log("Product fetched from DB:", product);

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
    console.error("Error in route handler:", error);
    next(error);
  }
});

// Update a product by _id
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await updateProduct(id, updateData);
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

// Delete a product by _id
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
