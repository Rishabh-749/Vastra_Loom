import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
});

export const createProduct = async (formData) => {
    const response = await productApiInstance.post("/", formData);
    return response.data;
};

export const getSellerProduct = async () => {
    const response = await productApiInstance.get("/seller");
    return response.data;
};

export const getAllProducts = async () => {
    const response = await productApiInstance.get("/");
    return response.data;
};

export const getProductDetails = async (id) => {
    const response = await productApiInstance.get(`/detail/${id}`);
    return response.data;
};

export const addProductVariant = async (productId, formData) => {
    const response = await productApiInstance.post(`/${productId}/variants`, formData);
    return response.data;
};

export const updateVariantStock = async (productId, variantId, stock) => {
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}/stock`, {
        stock
    });
    return response.data;
};

export const updateProductStock = async (productId, stock) => {
    const response = await productApiInstance.patch(`/${productId}/stock`, {
        stock
    });
    return response.data;
};