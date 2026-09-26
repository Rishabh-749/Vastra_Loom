import { useDispatch, useSelector } from "react-redux";
import {
  addItem,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../services/cart.api";
import {
  setCart,
  setLoading,
  setError,
  clearCartState,
} from "../state/cart.slice";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, currency, totalItems, loading, error } = useSelector(
    (state) => state.cart
  );

  const handleGetCart = async () => {
    try {
      dispatch(setLoading(true));
      const data = await getCart();
      if (data?.cart) {
        dispatch(setCart(data.cart));
      }
      return data?.cart;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load cart";
      dispatch(setError(msg));
      throw err;
    }
  };

  const handleAddItem = async ({ productId, variantId, quantity = 1 }) => {
    try {
      dispatch(setLoading(true));
      const data = await addItem({ productId, variantId, quantity });
      if (data?.cart) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to add item";
      dispatch(setError(msg));
      throw err;
    }
  };

  const handleUpdateQuantity = async ({ productId, variantId, quantity, action }) => {
    try {
      dispatch(setLoading(true));
      const data = await updateQuantity({ productId, variantId, quantity, action });
      if (data?.cart) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update quantity";
      dispatch(setError(msg));
      throw err;
    }
  };

  const handleRemoveItem = async ({ productId, variantId }) => {
    try {
      dispatch(setLoading(true));
      const data = await removeItem({ productId, variantId });
      if (data?.cart) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to remove item";
      dispatch(setError(msg));
      throw err;
    }
  };

  const handleClearCart = async () => {
    try {
      dispatch(setLoading(true));
      await clearCart();
      dispatch(clearCartState());
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to clear cart";
      dispatch(setError(msg));
      throw err;
    }
  };

  const resetCartState = () => {
    dispatch(clearCartState());
  };

  return {
    items,
    totalPrice,
    currency,
    totalItems,
    loading,
    error,
    handleGetCart,
    handleAddItem,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    resetCartState,
  };
};