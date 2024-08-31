import express from "express";
import slugify from "slugify";
import {
  deleteSubCategory,
  getASubCategory,
  getAllSubCategories,
  getAllSubCategoriesByParentCatId,
  insertSubCategory,
  updateSubCategory,
} from "../models/subcategory/SubCategoryModal.js";

const router = express.Router();

// Create sub-category
router.post("/", async (req, res) => {
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
        message: "New sub-category has been added.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Unable to add sub-category, try again later.",
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
router.get("/", async (req, res) => {
  try {
    const categories = await getAllSubCategories();
    res.json({
      status: "success",
      message: "Fetched all sub-categories.",
      categories,
    });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching sub-categories.",
    });
  }
});

// Get sub-category by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await getASubCategory(slug);

    if (category) {
      return res.json({
        status: "success",
        message: "Sub-category fetched successfully.",
        category,
      });
    }

    res.status(404).json({
      status: "error",
      message: "Sub-category not found.",
    });
  } catch (error) {
    console.error("Error fetching sub-category:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the sub-category.",
    });
  }
});

// Delete sub-category by slug
router.delete("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const deletedCategory = await deleteSubCategory(slug);

    if (!deletedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Sub-category not found.",
      });
    }

    res.json({
      status: "success",
      message: "Sub-category has been deleted successfully.",
      deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting sub-category:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the sub-category.",
    });
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
      return res.json({
        status: "success",
        message: "Sub-category updated successfully.",
        data: updatedSubCategory,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Sub-category not found.",
      });
    }
  } catch (error) {
    console.error("Error updating sub-category:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the sub-category.",
    });
  }
});

// Get all sub-categories by parent category id
router.get("/parent/:parentCatId", async (req, res) => {
  try {
    const { parentCatId } = req.params;
    const subCategories = await getAllSubCategoriesByParentCatId(parentCatId);

    res.json({
      status: "success",
      message: "Sub-categories fetched successfully.",
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching sub-categories by parent ID:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching sub-categories.",
    });
  }
});

export default router;
