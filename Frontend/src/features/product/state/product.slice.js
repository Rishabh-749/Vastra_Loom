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
        }
    }
});

export const { setAllProducts, setSellerProducts, setCurrentProduct, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;