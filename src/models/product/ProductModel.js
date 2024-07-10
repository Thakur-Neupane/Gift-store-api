import ProductSchema from "./ProductSchema.js";

export const insertProduct = (productObj) => {
  return ProductSchema(productObj).save();
};

export const getAllProducts = () => {
  return ProductSchema.find();
};

// export const getProduct = (filter) => {
//   return ProductSchema.findOne(filter);
// };

// export const deleteProduct = (filter) => {
//   return ProductSchema.findOneAndDelete(filter);
// };

// export const deleteManyProduct = (filter) => {
//   return ProductSchema.deleteMany(filter);
// };
