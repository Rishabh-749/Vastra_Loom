import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createProduct,
    getSellerProduct,
    getAllProducts,
    getProductDetails,
    addProductVariant,
    updateVariantStock,
    updateProductStock,
    deleteProduct,
    updateProductDiscount
} from "../services/product.api";
import {
    setSellerProducts,
    setAllProducts,
    setCurrentProduct,
    setLoading,
    setError,
    removeProduct,
    updateProductInState
} from "../state/product.slice";

export const useProduct = () => {
    const dispatch = useDispatch();
    const {
        allProducts = [],
        sellerProducts = [],
        currentProduct = null,
        loading: reduxLoading,
        error: reduxError
    } = useSelector((state) => state.product);

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

    const handleGetAllProducts = async () => {
        setLocalLoading(true);
        setLocalError(null);
        dispatch(setLoading(true));
        try {
            const data = await getAllProducts();
            const products = data.products || [];
            dispatch(setAllProducts(products));
            return products;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch catalog pieces";
            setLocalError(errorMessage);
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    const handleGetProductDetails = async (id) => {
        setLocalLoading(true);
        setLocalError(null);
        dispatch(setLoading(true));
        try {
            const data = await getProductDetails(id);
            dispatch(setCurrentProduct(data.product));
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to load product details";
            setLocalError(errorMessage);
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            setLocalLoading(false);
            dispatch(setLoading(false));
        }
    };

    const handleAddProductVariant = async (productId, formData) => {
        setLocalLoading(true);
        setLocalError(null);
        try {
            const data = await addProductVariant(productId, formData);
            if (data?.product) {
                dispatch(setCurrentProduct(data.product));
            }
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to add product variant";
            setLocalError(errorMessage);
            throw err;
        } finally {
            setLocalLoading(false);
        }
    };

    const handleUpdateVariantStock = async (productId, variantId, stock) => {
        try {
            const data = await updateVariantStock(productId, variantId, stock);
            if (data?.product) {
                dispatch(setCurrentProduct(data.product));
            }
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update variant stock";
            setLocalError(errorMessage);
            throw err;
        }
    };

    const handleUpdateProductStock = async (productId, stock) => {
        try {
            const data = await updateProductStock(productId, stock);
            if (data?.product) {
                dispatch(setCurrentProduct(data.product));
            }
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update product stock";
            setLocalError(errorMessage);
            throw err;
        }
    };

    const handleDeleteProduct = async (productId) => {
        setLocalLoading(true);
        setLocalError(null);
        try {
            const data = await deleteProduct(productId);
            dispatch(removeProduct(productId));
            return data;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete product";
            setLocalError(errorMessage);
            throw err;
        } finally {
            setLocalLoading(false);
        }
    };

    const handleUpdateProductDiscount = async (productId, updateData) => {
        setLocalLoading(true);
        setLocalError(null);
        try {
            const data = await updateProductDiscount(productId, updateData);
            if (data?.product) {
                dispatch(updateProductInState(data.product));
            }
            return data.product;
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to update discount";
            setLocalError(errorMessage);
            throw err;
        } finally {
            setLocalLoading(false);
        }
    };

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductDetails,
        handleAddProductVariant,
        handleUpdateVariantStock,
        handleUpdateProductStock,
        handleDeleteProduct,
        handleUpdateProductDiscount,
        loading: loading || reduxLoading,
        error: error || reduxError,
        allProducts,
        sellerProducts,
        currentProduct,
    };
};