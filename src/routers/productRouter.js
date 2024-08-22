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
import UserSchema from "../models/user/UserSchema.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Get a specific number of products
router.get("/count/:count", async (req, res, next) => {
  try {
    const { count } = req.params;
    const products = await Product.find().limit(parseInt(count));

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

// Sorting of the users
router.get("/products", async (req, res, next) => {
  try {
    const { sort = "createdAt", order = "desc", limit = 5 } = req.query;

    // Validate and sanitize inputs
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

    // Fetch products with sorting and limiting
    const products = await Product.find({})
      .populate("Category")
      .populate("SubCategory")
      .sort([[sort, order]]) // Ensure sorting is applied here
      .limit(parsedLimit)
      .exec();

    if (!products.length) {
      return res.status(404).json({
        status: "error",
        message: "No products found",
      });
    }

    res.status(200).json({
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
    const productId = req.params.id; // Get the product ID from the request parameters
    const { star } = req.body; // Extract the rating from the request body

    // Fetch the product and user
    const product = await ProductSchema.findById(productId).exec();
    const user = await UserSchema.findOne({ email: req.user.email }).exec();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has already rated the product
    let existingRatingObject = product.ratings.find(
      (ele) => ele.postedBy.toString() === user._id.toString()
    );

    if (existingRatingObject === undefined) {
      // User has not rated the product, add a new rating
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
        { new: true } // Return the updated document
      ).exec();

      console.log("Rating added:", ratingAdded);
      res.json(ratingAdded);
    } else {
      // User has already rated the product, update the existing rating
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
        { new: true } // Return the updated document
      ).exec();

      if (ratingUpdated.nModified === 0) {
        return res.status(400).json({ error: "Failed to update rating" });
      }

      // Fetch and return the updated product with the new rating
      const updatedProduct = await ProductSchema.findById(productId).exec();
      res.json(updatedProduct);
    }
  } catch (err) {
    next(err);
  }
});

// Get related products based on category
// Get related products based on category
router.get("/related/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .limit(6)
      .exec();

    res.json({ status: "success", products: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category ID
router.get("/category/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId });

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

    const products = await Product.find({ subCategories: subCategoryId });

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

const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("Category")
    .populate("SubCategory")
    .exec();
  res.json(products);
};

router.post("/search/filters", async (req, res, next) => {
  const { query } = req.body;

  if (query) {
    console.log("query", query);
    await handleQuery(req, res, query);
  }
});

export default router;
