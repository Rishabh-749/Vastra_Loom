import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        allProducts: [],
        sellerProducts: [],
        currentProduct: null,
        loading: false,
        error: null,
    },
    reducers: {
        setAllProducts: (state, action) => {
            state.allProducts = action.payload;
        },
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload;
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        removeProduct: (state, action) => {
            const id = action.payload;
            state.allProducts = state.allProducts.filter(p => p._id !== id);
            state.sellerProducts = state.sellerProducts.filter(p => p._id !== id);
            if (state.currentProduct?._id === id) {
                state.currentProduct = null;
            }
        },
        updateProductInState: (state, action) => {
            const updated = action.payload;
            if (!updated?._id) return;
            state.allProducts = state.allProducts.map(p => p._id === updated._id ? updated : p);
            state.sellerProducts = state.sellerProducts.map(p => p._id === updated._id ? updated : p);
            if (state.currentProduct?._id === updated._id) {
                state.currentProduct = updated;
            }
        }
    }
});

export const {
    setAllProducts,
    setSellerProducts,
    setCurrentProduct,
    setLoading,
    setError,
    removeProduct,
    updateProductInState
} = productSlice.actions;
export default productSlice.reducer;