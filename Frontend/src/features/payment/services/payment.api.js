import axios from "axios";

const paymentApiInstance = axios.create({
  baseURL: "/api/payment",
  withCredentials: true,
});

/**
 * Fetch Razorpay Public Key ID
 */
export const getRazorpayKey = async () => {
  const response = await paymentApiInstance.get("/key");
  return response.data;
};

/**
 * Initiate Razorpay Order on server
 * @param {Object} [shippingAddress]
 */
export const createPaymentOrder = async (shippingAddress = {}) => {
  const response = await paymentApiInstance.post("/create-order", {
    shippingAddress,
  });
  return response.data;
};

/**
 * Verify cryptographic payment signature with backend
 * @param {Object} paymentData
 */
export const verifyPayment = async (paymentData) => {
  const response = await paymentApiInstance.post("/verify", paymentData);
  return response.data;
};

/**
 * Get all past orders placed by authenticated user
 */
export const getMyOrders = async () => {
  const response = await paymentApiInstance.get("/my-orders");
  return response.data;
};

/**
 * Get single order details by ID
 * @param {string} orderId
 */
export const getOrderById = async (orderId) => {
  const response = await paymentApiInstance.get(`/order/${orderId}`);
  return response.data;
};
