import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

// Public key access
paymentRouter.get("/key", getRazorpayKey);

// Protected payment endpoints
paymentRouter.post("/create-order", authenticateUser, createOrder);
paymentRouter.post("/verify", authenticateUser, verifyPayment);
paymentRouter.get("/my-orders", authenticateUser, getMyOrders);
paymentRouter.get("/order/:orderId", authenticateUser, getOrderById);

export default paymentRouter;
