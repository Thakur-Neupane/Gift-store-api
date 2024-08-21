import express from "express";
const router = express.Router();
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

// Create category
router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    if (typeof title === "string" && title.length) {
      const slug = slugify(title, {
        lower: true,
      });

      const cat = await insertCategory({
        title,
        slug,
      });

      if (cat?._id) {
        return res.json({
          status: "success",
          message: "New category has been added",
        });
      }
    }

    res.json({
      status: "error",
      message: "Unable to add category, try again later",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This category slug already exist, please change the name of the Category and try agian.";
      error.statusCode = 200;
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
      message: "New category has been added",
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
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    res.json({
      status: "success",
      category,
    });
  } catch (error) {
    next(error);
  }
});
// delete category
router.delete("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const deletedCategory = await deleteCategory(slug);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
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
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update categories
router.put("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const updatedCategory = await updateCategory(slug, {
      title: req.body.title,
      slug: slugify(req.body.title),
      status: req.body.status,
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      status: "success",
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get all sub-categories by parent category id
router.get("/sub-category/:_id", async (req, res, next) => {
  try {
    const subs = await SubCategory.find({ parent: req.params._id }).exec();
    res.json(subs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
