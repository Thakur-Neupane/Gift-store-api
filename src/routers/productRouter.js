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
import UserSchema from "../models/user/UserSchema.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route to upload images
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
router.post("/", async (req, res) => {
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
    const prod = await ProductSchema.create({
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

    res.json({
      status: "success",
      message: "New product has been added",
      data: prod,
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This product slug or SKU already exists. Please change the name of the product or SKU and try again.";
      error.statusCode = 400;
    }
    res
      .status(error.statusCode || 500)
      .json({ status: "error", message: error.message });
  }
});

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json({
      status: "success",
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
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "ID parameter is missing",
      });
    }

    const product = await ProductSchema.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      product,
    });
  } catch (error) {
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
    res.status(500).json({
      status: "error",
      message: "Error deleting product: " + error.message,
    });
  }
});

// Get a specific number of products
router.get("/count/:count", async (req, res, next) => {
  try {
    const { count } = req.params;
    const products = await ProductSchema.find().limit(parseInt(count));

    if (!products.length) {
      return res.status(404).json({
        status: "error",
        message: "No products found",
      });
    }

    res.json({
      status: "success",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Sorting of products
router.get("/products", async (req, res, next) => {
  try {
    const { sort = "createdAt", order = "desc", limit = 5 } = req.query;

    const validSortFields = ["createdAt", "sold"];
    const validOrders = ["asc", "desc"];

    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sort field",
      });
    }

    if (!validOrders.includes(order)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sort order",
      });
    }

    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid limit value",
      });
    }

    const products = await ProductSchema.find({})
      .populate("Category")
      .populate("SubCategory")
      .sort([[sort, order]])
      .limit(parsedLimit)
      .exec();

    if (!products.length) {
      return res.status(404).json({
        status: "error",
        message: "No products found",
      });
    }

    res.json({
      status: "success",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Review of product
router.put("/star/:id", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { star } = req.body;

    const product = await ProductSchema.findById(productId).exec();
    const user = await UserSchema.findOne({ email: req.user.email }).exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let existingRatingObject = product.ratings.find(
      (ele) => ele.postedBy.toString() === user._id.toString()
    );

    if (!existingRatingObject) {
      const ratingAdded = await ProductSchema.findByIdAndUpdate(
        product._id,
        {
          $push: {
            ratings: {
              star,
              postedBy: user._id,
            },
          },
        },
        { new: true }
      ).exec();

      res.json(ratingAdded);
    } else {
      const ratingUpdated = await ProductSchema.updateOne(
        {
          _id: product._id,
          "ratings.postedBy": user._id,
        },
        {
          $set: {
            "ratings.$.star": star,
          },
        },
        { new: true }
      ).exec();

      if (ratingUpdated.nModified === 0) {
        return res.status(400).json({ error: "Failed to update rating" });
      }

      const updatedProduct = await ProductSchema.findById(productId).exec();
      res.json(updatedProduct);
    }
  } catch (err) {
    next(err);
  }
});

// Get related products based on category
router.get("/related/:id", async (req, res) => {
  try {
    const product = await ProductSchema.findById(req.params.id).exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await ProductSchema.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .limit(6)
      .exec();

    res.json({ status: "success", products: relatedProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category ID
router.get("/category/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const products = await ProductSchema.find({ category: categoryId });

    res.json({
      status: "success",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Route to get products by subcategory ID
router.get("/subcategory/:subCategoryId", async (req, res, next) => {
  try {
    const { subCategoryId } = req.params;

    const products = await ProductSchema.find({ subCategories: subCategoryId });

    if (!products.length) {
      return res.status(404).json({
        status: "error",
        message: "No products found for this subcategory",
      });
    }

    res.json({
      status: "success",
      products,
    });
  } catch (error) {
    next(error);
  }
});

// Search with filters
router.post("/search/filters", async (req, res, next) => {
  const { query } = req.body;

  if (query) {
    try {
      const products = await ProductSchema.find({ $text: { $search: query } })
        .populate("Category")
        .populate("SubCategory")
        .exec();
      res.json({ status: "success", products });
    } catch (error) {
      next(error);
    }
  } else {
    res
      .status(400)
      .json({ status: "error", message: "No search query provided" });
  }
});

// Get highest-rated products
router.get("/highest-rated", async (req, res) => {
  try {
    const products = await ProductSchema.aggregate([
      {
        $addFields: {
          averageRating: { $avg: "$ratings.star" },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    if (!products.length) {
      return res
        .status(404)
        .json({ status: "error", message: "No products found" });
    }

    res.json({ status: "success", data: products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Helper function to calculate discount
const calculateDiscount = (price, salesPrice) => {
  if (price <= 0) return 0;
  return ((price - salesPrice) / price) * 100;
};

// Get products sorted by discount
router.get("/discount", async (req, res) => {
  try {
    const products = await ProductSchema.find();

    const productsWithDiscount = products
      .map((product) => {
        const discount = product.salesPrice
          ? calculateDiscount(product.price, product.salesPrice)
          : 0;
        return { ...product.toObject(), discount };
      })
      .sort((a, b) => b.discount - a.discount);

    res.json({
      status: "success",
      products: productsWithDiscount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
