import CategorySchema from "./CategorySchema.js";

export const insertCategory = (categoryObj) => {
  return CategorySchema(categoryObj).save();
};

export const getAllCategories = () => {
  return CategorySchema.find();
};

export const sortCategories = () => {
  return CategorySchema.find().sort({ createdAt: -1 }).exec();
};

export const getACategory = (slug) => {
  return CategorySchema.findOne({ slug });
};

export const deleteCategory = (slug) => {
  return CategorySchema.findOneAndDelete({ slug });
};

export const updateCategory = (slug, updateData) => {
  return CategorySchema.findOneAndUpdate({ slug }, updateData, { new: true });
};

// export const deleteManyCategory = (filter) => {
//   return CategorySchema.deleteMany(filter);
// };
