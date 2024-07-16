import SubCategorySchema from "./SubCategorySchema.js";

export const insertSubCategory = (categoryObj) => {
  return SubCategorySchema(categoryObj).save();
};

export const getAllSubCategories = () => {
  return SubCategorySchema.find();
};

export const sortSubCategories = () => {
  return SubCategorySchema.find().sort({ createdAt: -1 }).exec();
};

export const getASubCategory = (slug) => {
  return SubCategorySchema.findOne({ slug });
};

export const deleteSubCategory = (slug) => {
  return CategorySchema.findOneAndDelete({ slug });
};

export const updateSubCategory = (slug, updateData) => {
  return SubCategorySchema.findOneAndUpdate({ slug }, updateData, {
    new: true,
  });
};

// export const deleteManyCategory = (filter) => {
//   return CategorySchema.deleteMany(filter);
// };
