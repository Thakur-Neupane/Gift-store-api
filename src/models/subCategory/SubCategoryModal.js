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
  return SubCategorySchema.findOneAndDelete({ slug });
};

export const updateSubCategory = (slug, updateData) => {
  return SubCategorySchema.findOneAndUpdate({ slug }, updateData, {
    new: true,
  });
};

export const getAllSubCategoriesByParentCatId = (parentCatId) => {
  return SubCategorySchema.find({ parentCatId });
};
// export const deleteManyCategory = (filter) => {
//   return CategorySchema.deleteMany(filter);
// };
