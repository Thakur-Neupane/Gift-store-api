import express from "express";
const router = express.Router();
import slugify from "slugify";
import {
  deleteSubCategory,
  getASubCategory,
  getAllSubCategories,
  insertSubCategory,
  sortSubCategories,
  updateSubCategory,
} from "../models/subcategory/SubCategoryModal.js";

// Create category
router.post("/", async (req, res, next) => {
  try {
    const { title, parentCatId } = req.body;

    if (typeof title === "string" && title.length) {
      const slug = slugify(title, { lower: true });

      const subCat = await insertSubCategory({
        title,
        slug,
        parent: parentCatId,
      });

      if (subCat?._id) {
        return res.json({
          status: "success",
          message: "New sub-category has been added",
        });
      }
    }

    res.json({
      status: "error",
      message: "Unable to add sub-category, try again later",
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate")) {
      error.message =
        "This sub-category slug already exists, please change the name and try again.";
      error.statusCode = 200;
    }
    next(error);
  }
});

// Get all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await getAllSubCategories();
    res.json({
      status: "success",
      message: "Fetched the new Subcategories.",
      categories,
    });

    res.json({});
  } catch (error) {
    next(error);
  }
});

// get one category
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await getASubCategory(slug);
    res.json({
      status: "success",
      message: "New Subcategory has been added",
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
    const deletedCategory = await deleteSubCategory(slug);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      status: "success",
      message: "The Sub-category has been deleted successfully.",
      deletedCategory,
    });
  } catch (error) {
    next(error);
  }
});

// Sort categories
router.get("/sort", async (req, res, next) => {
  try {
    const categories = await sortSubCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update categories
router.put("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const updatedSubCategory = await updateSubCategory(slug, {
      title: req.body.title,
      slug: slugify(req.body.title),
      status: req.body.status,
    });

    if (updatedSubCategory) {
      return res.status(200).json({
        status: "success",
        message: "Sub-Category updated successfully.",
        data: updatedSubCategory,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Sub-category not found.",
      });
    }
  } catch (error) {
    console.error("Error updating sub-category:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating the sub-category.",
    });
  }
});

export default router;
