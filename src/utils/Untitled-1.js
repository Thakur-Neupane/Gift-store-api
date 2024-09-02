import { createSlice } from "@reduxjs/toolkit";

const initialState = JSON.parse(localStorage.getItem("cart")) || [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { _id, color, count } = action.payload;
      const productIndex = state.findIndex((product) => product._id === _id);
      if (productIndex > -1) {
        state[productIndex] = { ...state[productIndex], color, count };
      } else {
        state.push(action.payload);
      }
      localStorage.setItem("cart", JSON.stringify(state)); // Sync with local storage
    },
    updateCartProductColor(state, action) {
      const { _id, color } = action.payload;
      const product = state.find((product) => product._id === _id);
      if (product) {
        product.color = color;
        localStorage.setItem("cart", JSON.stringify(state)); // Sync with local storage
      }
    },
    updateCartProductCount(state, action) {
      const { _id, count } = action.payload;
      const product = state.find((product) => product._id === _id);
      if (product) {
        product.count = count;
        localStorage.setItem("cart", JSON.stringify(state)); // Sync with local storage
      }
    },
    // Other reducers...
  },
});

export const { addToCart, updateCartProductColor, updateCartProductCount } =
  cartSlice.actions;
export default cartSlice.reducer;
