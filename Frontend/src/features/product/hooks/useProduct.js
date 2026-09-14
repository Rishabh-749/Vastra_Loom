import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, getSellerProduct } from "../services/product.api";
import { setSellerProducts, setLoading, setError } from "../state/product.slice";

export const useProduct = () => {
    const dispatch = useDispatch();
    const { sellerProducts, loading: reduxLoading, error: reduxError } = useSelector((state) => state.product);
    const [loading, setLocalLoading] = useState(false);
    const [error, setLocalError] = useState(null);

    const handleCreateProduct = async (formData) => {
        setLocalLoading(true);
        setLocalError(null);
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const data = await createProduct(formData);
            dispatch(setLoading(false));
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to create product";
            setLocalError(errorMessage);
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    const handleGetSellerProduct = async () => {
        setLocalLoading(true);
        setLocalError(null);
        dispatch(setLoading(true));
        try {
            const data = await getSellerProduct();
            const products = data.products || data.product || [];
            dispatch(setSellerProducts(products));
            return products;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch products";
            setLocalError(errorMessage);
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        loading: loading || reduxLoading,
        error: error || reduxError,
        sellerProducts,
    };
};