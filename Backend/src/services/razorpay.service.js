import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/config.js";

export const razorpayInstance = new Razorpay({
  key_id: config.RAZORPAY_KEY,
  key_secret: config.RAZORPAY_SECRET,
});

/**
 * Create a new order on Razorpay servers
 * @param {Object} options
 * @param {number} options.amount - Amount in paise (e.g. 1000 INR = 100000 paise)
 * @param {string} options.currency - Default 'INR'
 * @param {string} options.receipt - Unique internal receipt string
 * @param {Object} [options.notes] - Custom metadata
 */
export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  const options = {
    amount: Math.round(amount),
    currency,
    receipt,
    notes,
  };
  return await razorpayInstance.orders.create(options);
};

/**
 * Verify Razorpay payment signature
 * @param {Object} params
 * @param {string} params.orderId - razorpay_order_id
 * @param {string} params.paymentId - razorpay_payment_id
 * @param {string} params.signature - razorpay_signature
 * @returns {boolean}
 */
export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const generatedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};
