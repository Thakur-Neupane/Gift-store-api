import ProductSchema from "./ProductSchema.js";

export const insertProduct = (productObj) => {
  return ProductSchema(productObj).save();
};

export const getAllProducts = () => {
  return ProductSchema.find();
};

export const deleteProduct = (_id) => {
  return ProductSchema.findByIdAndDelete(_id);
};

export const getOneProduct = (_id) => {
  return ProductSchema.findById(_id);
};

export const updateProduct = (_id, updateData) => {
  return ProductSchema.findByIdAndUpdate(_id, updateData, {
    new: true,
  });
};
