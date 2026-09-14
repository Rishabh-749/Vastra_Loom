import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

export const createProduct = async (formdata) => {
    const response = await productApiInstance.post("/", formdata)
    return response.data
}

export const getSellerProduct = async () => {
    const response = await productApiInstance.post("/seller")
    return response.data
}