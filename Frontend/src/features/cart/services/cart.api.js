import axios from "axios";

const cartApiInstance = axios.create({
  baseURL: "/api/cart",
  withCredentials: true,
});

/**
 * Add product (base piece or variant) to user's cart
 */
export const addItem = async ({ productId, variantId, quantity = 1 }) => {
  const cleanVariantId =
    variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
      ? variantId
      : null;

  const url = cleanVariantId ? `/add/${productId}/${cleanVariantId}` : `/add/${productId}`;
  const response = await cartApiInstance.post(url, { quantity });
  return response.data;
};

/**
 * Fetch the authenticated user's cart
 */
export const getCart = async () => {
  const response = await cartApiInstance.get("/");
  return response.data;
};

/**
 * Update item quantity in cart (action: 'increment' | 'decrement' | 'set')
 */
export const updateQuantity = async ({ productId, variantId, quantity, action }) => {
  const cleanVariantId =
    variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
      ? variantId
      : null;

  const url = cleanVariantId ? `/quantity/${productId}/${cleanVariantId}` : `/quantity/${productId}`;
  const response = await cartApiInstance.patch(url, { quantity, action });
  return response.data;
};

/**
 * Remove an item from the cart
 */
export const removeItem = async ({ productId, variantId }) => {
  const cleanVariantId =
    variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
      ? variantId
      : null;

  const url = cleanVariantId ? `/item/${productId}/${cleanVariantId}` : `/item/${productId}`;
  const response = await cartApiInstance.delete(url);
  return response.data;
};

/**
 * Clear all items from the cart
 */
export const clearCart = async () => {
  const response = await cartApiInstance.delete("/clear");
  return response.data;
};