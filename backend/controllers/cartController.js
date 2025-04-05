// controllers/cartController.js
const User = require("../models/User");
const Product = require("../models/Product");

// إضافة منتج إلى السلة
const addToCart = async (req, res) => {
  console.log(Product);
  try {
    const { productId, quantity = 1 } = req.body;
    // console.log("Received productId:", productId);

    // التحقق من وجود المنتج
    const product = await Product.findById(productId);
    // console.log(product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // التحقق من أن المنتج معتمد
    if (product.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Product is not available for purchase" });
    }

    // التحقق من توفر الكمية
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // تحديث سلة المستخدم
    const user = await User.findById(req.user.id);

    // التحقق مما إذا كان المنتج موجودًا بالفعل في السلة
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // إذا كان المنتج موجودًا، قم بتحديث الكمية
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // إذا لم يكن موجودًا، أضفه جديدًا
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// الحصول على محتويات السلة مع تفاصيل المنتجات
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "cart.product",
      select: "name price images stock status",
      match: { status: "approved", isDeleted: false },
    });

    // تصفية المنتجات غير الموجودة أو غير المتاحة
    const filteredCart = user.cart.filter(
      (item) => item.product && item.product.stock > 0
    );

    // حساب الإجمالي
    const total = filteredCart.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    res.status(200).json({
      items: filteredCart,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// تحديث كمية المنتج في السلة
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // التحقق من أن الكمية صحيحة
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // التحقق من وجود المنتج
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // التحقق من توفر الكمية
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // تحديث السلة
    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    res.status(200).json({
      message: "Cart updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// إزالة منتج من السلة
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// تفريغ السلة بالكامل
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
