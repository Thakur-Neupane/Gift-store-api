import express from "express";
import {
  getAllReviews,
  insertReview,
  updateAReviewById,
  deleteAReviewById,
  getReviewByUserAndProduct,
  getReviewsByProductId,
} from "../models/reviews/ReviewModal.js";

const router = express.Router();

// Add or update a review
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if the review already exists
    const existingReview = await getReviewByUserAndProduct(userId, productId);

    if (existingReview) {
      // Update the existing review
      const updatedReview = await updateAReviewById(
        existingReview._id,
        req.body
      );
      return res.json({
        status: "success",
        message: "Your review has been updated successfully.",
        review: updatedReview,
      });
    } else {
      // Insert a new review
      const newReview = await insertReview(req.body);
      return res.json({
        status: "success",
        message: "Your new review has been added successfully.",
        review: newReview,
      });
    }
  } catch (error) {
    console.error("Error adding or updating review:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while adding or updating the review.",
    });
  }
});

// Update review
router.patch("/", async (req, res) => {
  try {
    const { _id, status, title, rating, description } = req.body;
    const review = await updateAReviewById(_id, {
      status,
      title,
      rating,
      description,
    });

    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found.",
      });
    }

    return res.json({
      status: "success",
      message: "The review has been updated successfully.",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the review.",
    });
  }
});

// Delete review
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteAReviewById(id);

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Review not found.",
      });
    }

    return res.json({
      status: "success",
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the review.",
    });
  }
});

// Get all reviews for admin
router.get("/all", async (req, res) => {
  try {
    const reviews = await getAllReviews();
    return res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching all reviews.",
    });
  }
});

// Get active reviews for public
router.get("/", async (req, res) => {
  try {
    const reviews = await getAllReviews({ status: "active" });
    return res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching active reviews:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching active reviews.",
    });
  }
});

// Get reviews by product ID
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    // Fetch reviews and sort by rating in descending order
    const reviews = await getReviewsByProductId(productId);
    reviews.sort((a, b) => b.rating - a.rating);

    return res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews by product ID:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching reviews by product ID.",
    });
  }
});

export default router;
