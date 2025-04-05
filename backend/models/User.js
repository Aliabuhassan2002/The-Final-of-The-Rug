const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["end-user", "provider", "admin"],
      default: "end-user",
    },
    providerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
    },
    isApproved: { type: Boolean, default: false },
    profileImage: { type: String, default: "" }, // Profile Picture URL
    identityDocument: { type: String, default: "" },
    address: { type: String },
    phone: { type: String },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        color: { type: String }, // Add these fields
        size: { type: String },
      },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
