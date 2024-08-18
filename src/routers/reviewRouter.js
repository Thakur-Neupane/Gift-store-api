import express from "express";
import {
  getAllReviews,
  insertReview,
  updateAReviewById,
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
    next(error);
  }
});

// Update review
router.patch("/", async (req, res, next) => {
  try {
    const { _id, status, title, ratings, message } = req.body;
    const review = await updateAReviewById(_id, {
      status,
      title,
      ratings,
      message,
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
