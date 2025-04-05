const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        color: String,
        size: String,
        provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    shippingAddress: {
      name: String,
      email: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "credit_card", "stripe"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    transactionId: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
