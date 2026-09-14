import {createSlice} from "@reduxjs/toolkit";

const savedUser = (() => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
})();

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: savedUser,
        loading: false,
        error: null
    },
    reducers: {
        setUser: (state, action) =>{
            state.user = action.payload;
        },
        setLoading: (state, action) =>{
            state.loading = action.payload;
        },
        setError: (state, action) =>{
            state.error = action.payload;
        }
    }
})

export const {setError, setUser, setLoading} = authSlice.actions;
export default authSlice.reducer;