import { setError, setUser, setLoading } from "../state/auth.slice";
import { register, login, getMe } from "../services/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);

    const handleRegister = async ({ email, password, fullname, contact, isSeller = false }) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const data = await register({ email, password, fullname, contact, isSeller });
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || "Registration failed";
            dispatch(setError(errorMsg));
            throw err;
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
        } catch {
            localStorage.removeItem("user");
            dispatch(setUser(null));
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        dispatch(setUser(null));
    };

    return {
        user,
        loading,
        error,
        handleRegister,
        handleLogin,
        handleCheckAuth,
        handleLogout
    };
}; 