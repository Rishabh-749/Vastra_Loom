import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  resolvedImage: {
    type: String,
    default: "",
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const shippingAddressSchema = new mongoose.Schema({
  fullname: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  postalCode: { type: String, default: "" },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    shippingAddress: {
      type: shippingAddressSchema,
      default: () => ({}),
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "dispatched", "delivered", "cancelled"],
      default: "placed",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
