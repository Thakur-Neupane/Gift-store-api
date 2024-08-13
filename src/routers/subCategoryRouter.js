import express from "express";
const router = express.Router();
import slugify from "slugify";
import {
  deleteSubCategory,
  getASubCategory,
  getAllSubCategories,
  getAllSubCategoriesByParentCatId,
  insertSubCategory,
  sortSubCategories,
  updateSubCategory,
} from "../models/subcategory/SubCategoryModal.js";

// Create sub-category
router.post("/", async (req, res, next) => {
  try {
    const { title, parentCatId } = req.body;

    if (!title || !parentCatId) {
      return res.status(400).json({
        status: "error",
        message: "Title and Parent Category ID are required.",
      });
    }

    const slug = slugify(title, { lower: true });

    const subCat = await insertSubCategory({
      title,
      slug,
      parent: parentCatId, // Ensure field name matches schema
    });

    if (subCat._id) {
      return res.status(201).json({
        status: "success",
        message: "New sub-category has been added",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Unable to add sub-category, try again later",
    });
  } catch (error) {
    console.error("Error creating sub-category:", error);
    res.status(500).json({
      status: "error",
      message: error.message.includes("E11000")
        ? "This sub-category slug already exists, please change the name and try again."
        : "An error occurred.",
    });
  }
});

// Get all sub-categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await getAllSubCategories();
    res.json({
      status: "success",
      message: "Fetched all sub-categories.",
      categories,
    });
  } catch (error) {
    next(error);
  }
});

// Get sub-category by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await getASubCategory(slug);
    res.json({
      status: "success",
      message: "Sub-category fetched successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
});

// Delete sub-category by slug
router.delete("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const deletedCategory = await deleteSubCategory(slug);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    return res.json({
      status: "success",
      message: "Sub-category has been deleted successfully.",
      deletedCategory,
    });
  } catch (error) {
    next(error);
  }
});

// Update sub-category by slug
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
        message: "Sub-category updated successfully.",
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

// Get all sub-categories by parent category id
router.get("/parent/:parentCatId", async (req, res, next) => {
  try {
    const { parentCatId } = req.params;
    const subCategories = await getAllSubCategoriesByParentCatId(parentCatId);

    res.json({
      status: "success",
      message: "Sub-categories fetched successfully",
      subCategories,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
