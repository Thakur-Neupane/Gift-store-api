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
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      status: "error",
      message: "User ID and Product ID are required",
    });
  }

  try {
    const existingReview = await getReviewByUserAndProduct(userId, productId);

    if (existingReview) {
      const updatedReview = await updateAReviewById(
        existingReview._id,
        req.body
      );
      return res.json({
        status: "success",
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    const newReview = await insertReview(req.body);
    res.status(201).json({
      status: "success",
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
});

// Update a review
router.patch("/", async (req, res, next) => {
  const { _id, status, title, rating, description } = req.body;

  if (!_id) {
    return res.status(400).json({
      status: "error",
      message: "Review ID is required",
    });
  }

  try {
    const updatedReview = await updateAReviewById(_id, {
      status,
      title,
      rating,
      description,
    });

    if (!updatedReview) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    res.json({
      status: "success",
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a review
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await deleteAReviewById(id);

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    res.json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get all reviews (admin access)
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

// Get active reviews (public access)
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
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "Product ID is required",
    });
  }

  try {
    const reviews = await getReviewsByProductId(productId);
    reviews.sort((a, b) => b.rating - a.rating);

    res.json({
      status: "success",
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
