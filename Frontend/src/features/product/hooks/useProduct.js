import { useDispatch } from "react-redux";
import { createProduct, getSellerProduct } from "../services/product.api";
import { setSellerProducts } from "../state/product.slice";

export const useProduct = () => {

    const dispatch = useDispatch();

    const handleCreateProduct = async (formData) => {
        const data = await createProduct(formData);
        return data.product
    }

    const handleGetSellerProduct = async () => {
        const data = await getSellerProduct();
        dispatch(setSellerProducts(data.product))
        return data.product
    }

    return {handleCreateProduct, handleGetSellerProduct};
}