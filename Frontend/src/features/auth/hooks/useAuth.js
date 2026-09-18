import { setError, setUser, setIsAuthChecked, setLoading } from "../state/auth.slice";
import { register, login, getMe, logout } from "../services/auth.api";
import { clearCartState } from "../../cart/state/cart.slice";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthChecked, loading, error } = useSelector((state) => state.auth);

    const handleRegister = async ({ email, password, fullname, contact, isSeller = false }) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const data = await register({ email, password, fullname, contact, isSeller });
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            const errorMsg = err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.message || err?.message || "Registration failed";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogin = async ({ email, password }) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const data = await login({ email, password });
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || "Login failed";
            dispatch(setError(errorMsg));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCheckAuth = async () => {
        try {
            const data = await getMe();
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            localStorage.removeItem("user");
            dispatch(setUser(null));
            dispatch(setIsAuthChecked(true));
            return null;
        }
    };

    const handleLogout = async () => {
        dispatch(setLoading(true));
        try {
            await logout();
        } catch (err) {
            console.error("Logout request error:", err);
        } finally {
            localStorage.removeItem("user");
            dispatch(setUser(null));
            dispatch(setIsAuthChecked(true));
            dispatch(clearCartState());
            dispatch(setLoading(false));
        }
    };

    return {
        user,
        isAuthChecked,
        loading,
        error,
        handleRegister,
        handleLogin,
        handleCheckAuth,
        handleLogout
    };
};