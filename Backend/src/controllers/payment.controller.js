import mongoose from "mongoose";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { getAggregatedCart } from "./cart.controller.js";
import { config } from "../config/config.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/razorpay.service.js";

/**
 * @route GET /api/payment/key
 * @desc Get public Razorpay Key ID
 */
export const getRazorpayKey = (req, res) => {
  return res.status(200).json({
    success: true,
    key: config.RAZORPAY_KEY,
  });
};

/**
 * @route POST /api/payment/create-order
 * @desc Create a Razorpay order from the user's active cart and store pending order in DB
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // 1. Fetch user's cart using the optimized aggregation pipeline
    const cart = await getAggregatedCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your shopping bag is empty. Please add items to proceed.",
      });
    }

    // 2. Validate live stock for all items
    for (const item of cart.items) {
      if (item.isOutOfStock) {
        return res.status(400).json({
          success: false,
          message: `"${item.product?.title || "Item"}" is currently out of stock. Please adjust your bag.`,
        });
      }
      if (item.exceedsStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${item.liveStock} piece(s) available for "${item.product?.title || "Item"}". You requested ${item.quantity}.`,
        });
      }
    }

    // 3. Amount in paise (Razorpay expects smallest currency unit, e.g. 1 INR = 100 paise)
    const totalAmount = Math.max(1, Math.round(cart.totalPrice));
    const amountInPaise = totalAmount * 100;
    const currency = cart.currency || "INR";
    const receipt = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`;

    // 4. Create Razorpay order
    const rzpOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        userId: userId.toString(),
        totalItems: String(cart.totalItems || cart.items.length),
      },
    });

    // 5. Snapshot items for DB order
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      variant: item.variant || null,
      title: item.product.title,
      quantity: item.quantity,
      price: item.unitPrice,
      currency: item.currency || currency,
      resolvedImage: item.resolvedImage || "",
      attributes: item.attributes || {},
    }));

    // 6. Create internal Order record in MongoDB
    const dbOrder = await orderModel.create({
      user: userId,
      items: orderItems,
      totalAmount,
      currency,
      shippingAddress: shippingAddress || {},
      paymentStatus: "pending",
      orderStatus: "placed",
      razorpayOrderId: rzpOrder.id,
    });

    return res.status(200).json({
      success: true,
      message: "Razorpay order initiated successfully",
      orderId: dbOrder._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: config.RAZORPAY_KEY,
      customer: {
        name: req.user.fullname || "",
        email: req.user.email || "",
        contact: req.user.contact || "",
      },
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment order",
    });
  }
};

/**
 * @route POST /api/payment/verify
 * @desc Verify payment signature, confirm order, decrement stock, and clear cart
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      shippingAddress,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment credentials from payment gateway",
      });
    }

    // 1. Verify cryptographic HMAC SHA256 signature
    const isSignatureValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    // 2. Locate DB order
    const query = orderId
      ? { _id: orderId, user: userId }
      : { razorpayOrderId: razorpay_order_id, user: userId };

    const order = await orderModel.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order record not found",
      });
    }

    if (!isSignatureValid) {
      order.paymentStatus = "failed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Cryptographic signature mismatch. Payment verification failed.",
      });
    }

    // 3. Mark order as paid & confirmed
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }
    await order.save();

    // 4. Safely decrement inventory stock for each purchased item
    for (const item of order.items) {
      try {
        const product = await productModel.findById(item.product);
        if (product) {
          if (item.variant && product.variants && product.variants.length > 0) {
            const v = product.variants.find(
              (x) => x._id && x._id.toString() === item.variant.toString()
            );
            if (v && v.stock !== undefined) {
              v.stock = Math.max(0, v.stock - item.quantity);
            }
          }
          if (product.stock !== undefined) {
            product.stock = Math.max(0, product.stock - item.quantity);
          }
          await product.save();
        }
      } catch (stockErr) {
        console.error("Error decrementing stock for item:", item.title, stockErr);
      }
    }

    // 5. Clear the user's shopping bag
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and acquisition confirmed",
      order,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

/**
 * @route GET /api/payment/my-orders
 * @desc Get all orders placed by authenticated patron
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error in getMyOrders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order history",
    });
  }
};

/**
 * @route GET /api/payment/order/:orderId
 * @desc Get detailed order receipt by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order details",
    });
  }
};
