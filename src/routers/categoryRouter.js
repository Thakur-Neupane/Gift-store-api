import express from "express";
import slugify from "slugify";
import {
  deleteCategory,
  getACategory,
  getAllCategories,
  insertCategory,
  sortCategories,
  updateCategory,
} from "../models/category/CategoryModel.js";

import SubCategory from "../models/subCategory/SubCategorySchema.js";

const router = express.Router();

// Create category
router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title === "string" && title.length) {
      const slug = slugify(title, { lower: true });

      const cat = await insertCategory({ title, slug });

      if (cat?._id) {
        return res.json({
          status: "success",
          message: "New category has been added",
        });
      }
    }

    res.status(400).json({
      status: "error",
      message: "Unable to add category, try again later",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This category slug already exists, please change the name and try again.";
      error.statusCode = 400;
    }
    next(error);
  }
});

// Get all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json({
      status: "success",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// Get one category by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await getACategory(slug);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.json({
      status: "success",
      category,
    });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const deletedCategory = await deleteCategory(slug);

    if (!deletedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.json({
      status: "success",
      message: "The category has been deleted successfully.",
      deletedCategory,
    });
  } catch (error) {
    next(error);
  }
});

// Sort categories
router.get("/sort", async (req, res, next) => {
  try {
    const categories = await sortCategories();
    res.json({
      status: "success",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put("/:slug", async (req, res, next) => {
  const { slug } = req.params;
  const { title, status } = req.body;

  try {
    const updatedCategory = await updateCategory(slug, {
      title,
      slug: slugify(title),
      status,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.json({
      status: "success",
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    next(error);
  }
});

// Get all sub-categories by parent category id
router.get("/sub-category/:_id", async (req, res, next) => {
  try {
    const subs = await SubCategory.find({ parent: req.params._id }).exec();
    res.json({
      status: "success",
      subCategories: subs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
