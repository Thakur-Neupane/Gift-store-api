import Review from "./ReviewSchema.js";

// Get all reviews with an optional filter
export const getAllReviews = (filter = {}) => {
  return Review.find(filter);
};

// Get review by user and product
export const getReviewByUserAndProduct = (userId, productId) => {
  return Review.findOne({ userId, productId });
};

// Insert a review
export const insertReview = async (reviewData) => {
  const { userName, ...restOfData } = reviewData;

  const review = new Review({
    ...restOfData,
    userName: userName || "Anonymous",
  });

  return review.save();
};

// Update review by ID
export const updateAReviewById = (_id, obj) => {
  return Review.findByIdAndUpdate(_id, obj, { new: true });
};

// Delete review by ID
export const deleteAReviewById = (_id) => {
  return Review.findByIdAndDelete(_id);
};
