import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthChecked: false,
        loading: false,
        error: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthChecked = true;
        },
        setIsAuthChecked: (state, action) => {
            state.isAuthChecked = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { setError, setUser, setIsAuthChecked, setLoading } = authSlice.actions;
export default authSlice.reducer;