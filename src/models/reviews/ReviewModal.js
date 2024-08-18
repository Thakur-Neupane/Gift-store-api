import Review from "./ReviewSchema.js";

// Insert a review
export const insertReview = (obj) => {
  return new Review(obj).save();
};

// Get all reviews with an optional filter
export const getAllReviews = (filter = {}) => {
  return Review.find(filter);
};

// Update review by ID
export const updateAReviewById = (_id, obj) => {
  return Review.findByIdAndUpdate(_id, obj, { new: true });
};

// Delete review by ID
export const deleteAReviewById = (_id) => {
  return Review.findByIdAndDelete(_id);
};
