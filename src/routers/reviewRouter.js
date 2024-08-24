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
router.post("/", async (req, res, next) => {
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
      res.json({
        status: "success",
        message: "Your review has been updated successfully",
        review: updatedReview,
      });
    } else {
      // Insert a new review
      const newReview = await insertReview(req.body);
      res.json({
        status: "success",
        message: "Your new review has been added successfully",
        review: newReview,
      });
    }
  } catch (error) {
    next(error);
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
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }
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

// Get reviews by product ID
router.get("/product/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await getReviewsByProductId(productId);
    res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
