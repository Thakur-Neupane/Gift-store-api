import ProductSchema from "./ProductSchema.js";

export const insertProduct = (productObj) => {
  return ProductSchema(productObj).save();
};

export const getAllProducts = () => {
  return ProductSchema.find();
};

export const getOneProduct = (slug) => {
  return ProductSchema.findOne({ slug });
};

export const deleteProduct = (slug) => {
  return ProductSchema.findOneAndDelete({ slug });
};

export const updateProduct = (slug, updateData) => {
  return ProductSchema.findOneAndUpdate({ slug }, updateData, {
    new: true,
  });
};
