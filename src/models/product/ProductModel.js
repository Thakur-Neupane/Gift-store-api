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

export const updateProduct = (id, updateData) => {
  return ProductSchema.findByIdAndUpdate(id, updateData, {
    new: true,
  });
};
