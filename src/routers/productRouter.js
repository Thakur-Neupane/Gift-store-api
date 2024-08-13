import express from "express";
const router = express.Router();
import slugify from "slugify";

import {
  getAllProducts,
  insertProduct,
} from "../models/product/ProductModel.js";

router.post("/", async (req, res, next) => {
  try {
    const { name, sku, slug } = req.body;

    // Check for missing required fields
    if (!name || !sku || !req.body.qty || !req.body.price) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    // Generate slug if not provided
    const generatedSlug = slugify(name, { lower: true });
    const productSlug = slug || generatedSlug;

    const prod = await insertProduct({
      ...req.body,
      slug: productSlug,
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

export default router;
