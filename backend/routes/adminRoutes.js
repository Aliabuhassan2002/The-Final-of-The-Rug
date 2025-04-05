const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const {
  getUsers,
  deleteUser,
  getProducts,
  deleteProduct,
  updateProductStatus,
  getFeedback,
  updateFeedbackStatus,
  getSalesAnalytics,
  getStoreVisitors,
  createProduct,
  getProductsByProvider,
  restoreProduct,
  softDeleteProduct,
  updateProduct,
  getOrders,
  updateOrderStatus,
} = require("../controllers/adminController");
const {
  updateProviderRequestStatus,
  getProviderRequests,
} = require("../controllers/poviderReqController");
const upload = require("../config/multerConfig"); // Add this import
// User Management
router.get("/users", verifyToken, getUsers);
router.delete("/users/:id", verifyToken, deleteUser);

// Product Management
router.get("/products", verifyToken, getProducts);
router.delete("/products/:id", verifyToken, deleteProduct);
router.put("/products/:id/status", verifyToken, updateProductStatus);
// router.put("/products/:id", verifyToken, updateProduct);
router.put(
  "/products/:id",
  verifyToken,
  upload.array("images", 5),
  updateProduct
);
router.put("/products/:id/soft-delete", verifyToken, softDeleteProduct);
router.put("/products/:id/restore", verifyToken, restoreProduct);
router.get("/providers/:provider/products", verifyToken, getProductsByProvider);

// Feedback Management
router.get("/feedback", verifyToken, getFeedback);
router.put("/feedback/:id/status", verifyToken, updateFeedbackStatus);

// Analytics
router.get("/analytics/sales", verifyToken, getSalesAnalytics);
router.get("/analytics/visitors", verifyToken, getStoreVisitors);
// router.post("/products", verifyToken, createProduct);
router.post(
  "/products",
  verifyToken,
  upload.array("images", 5), // Allow up to 5 images
  createProduct
);
// GET /api/admin/providers - Fetch all providers
router.get("/providers", verifyToken, async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" });
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching providers", error });
  }
});

//Orders Management
router.get("/orders", verifyToken, getOrders);
router.put("/orders/:id/status", verifyToken, updateOrderStatus);
router.get("/provider-requests", verifyToken, getProviderRequests);
router.put("/provider-requests/:id", verifyToken, updateProviderRequestStatus);
module.exports = router;
