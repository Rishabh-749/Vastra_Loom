import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalPrice: 0,
  currency: "INR",
  totalItems: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      const payload = action.payload || {};
      state.items = payload.items || [];
      state.totalPrice = Number(payload.totalPrice) || 0;
      state.currency = payload.currency || "INR";
      state.totalItems =
        payload.totalItems !== undefined
          ? payload.totalItems
          : state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setCart, setLoading, setError, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;