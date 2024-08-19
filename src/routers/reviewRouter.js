import express from "express";
import {
  getAllReviews,
  insertReview,
  updateAReviewById,
  deleteAReviewById,
} from "../models/reviews/ReviewModal.js";

const router = express.Router();

// Add a new review
router.post("/", async (req, res, next) => {
  try {
    const review = await insertReview(req.body);
    res.json({
      status: "success",
      message: "Your new review has been added successfully",
      review,
    });
  } catch (error) {
    console.error("Error inserting review:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while adding the review",
    });
  }
});

// Update review
router.patch("/", async (req, res, next) => {
  try {
    const { _id, status, title, rating, description } = req.body;
    const review = await updateAReviewById(_id, {
      status,
      title,
      rating,
      description,
    });
    res.json({
      status: "success",
      message: "The review has been updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
});

// Delete review
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteAReviewById(id);
    res.json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get all reviews for admin
router.get("/all", async (req, res, next) => {
  try {
    const reviews = await getAllReviews();
    res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

// Get active reviews for public
router.get("/", async (req, res, next) => {
  try {
    const reviews = await getAllReviews({ status: "active" });
    res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
