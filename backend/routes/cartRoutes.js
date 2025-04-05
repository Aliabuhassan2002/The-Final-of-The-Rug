// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// إضافة منتج إلى السلة
router.post("/add", verifyToken, addToCart);

// الحصول على محتويات السلة
router.get("/", verifyToken, getCart);

// تحديث كمية المنتج في السلة
router.put("/:productId", verifyToken, updateCartItem);

// إزالة منتج من السلة
router.delete("/:productId", verifyToken, removeFromCart);

// تفريغ السلة بالكامل
router.delete("/", verifyToken, clearCart);

module.exports = router;
