const User = require("../models/User");
const Product = require("../models/Product");
const Contact = require("../models/Contact");
const Order = require("../models/Order");
const path = require("path");
const mongoose = require("mongoose");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const { showDeleted, provider } = req.query; // Changed from providerId to provider
    const query = {};

    if (provider) {
      query.provider = provider;
    }

    if (showDeleted !== "true") {
      query.isDeleted = false;
    }

    const products = await Product.find(query).populate("provider");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log("Received Product Data:", req.body);
    console.log("Received Files:", req.files);

    if (!mongoose.Types.ObjectId.isValid(req.body.provider)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock, 10);

    if (isNaN(price) || isNaN(stock)) {
      return res
        .status(400)
        .json({ message: "Price and stock must be numbers" });
    }

    // Process colors - support both array and string input
    let colors = [];
    if (req.body.colors) {
      try {
        colors =
          typeof req.body.colors === "string"
            ? req.body.colors.split(",").map((c) => c.trim())
            : Array.isArray(req.body.colors)
            ? req.body.colors
            : [req.body.colors];
      } catch (e) {
        colors = [req.body.colors];
      }
    } else if (req.body.color) {
      colors = [req.body.color]; // Backward compatibility
    }

    // Process images
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    const newProduct = new Product({
      ...req.body,
      price,
      stock,
      images,
      colors,
      color: colors[0], // Maintain backward compatibility
      status: "approved",
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Error creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Product soft deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    res.status(200).json({ message: "Product restored successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      images: existingImages,
      colors: inputColors,
      ...updateData
    } = req.body;

    // Process colors
    let colors = [];
    if (inputColors) {
      try {
        colors =
          typeof inputColors === "string"
            ? inputColors.split(",").map((c) => c.trim())
            : Array.isArray(inputColors)
            ? inputColors
            : [inputColors];
      } catch (e) {
        colors = [inputColors];
      }
    }

    // Process images
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages)
        ? existingImages
        : [existingImages];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    const updateObject = {
      ...updateData,
      images,
      ...(colors.length > 0 && {
        colors,
        color: colors[0], // Maintain backward compatibility
      }),
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateObject,
      { new: true }
    ).populate("provider");

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const getProductsByProvider = async (req, res) => {
  try {
    const products = await Product.find({
      provider: req.params.providerId,
      isDeleted: false,
    }).populate("provider");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Update product status (approve/reject)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all feedback
const getFeedback = async (req, res) => {
  try {
    const feedback = await Contact.find();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update feedback status (reviewed/pending)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    res.status(200).json({ totalOrders: orders.length, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get store visitors (mock data for now)
const getStoreVisitors = async (req, res) => {
  try {
    const visitors = 1000; // Replace with actual analytics logic
    res.status(200).json({ visitors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//Orders
// Get all orders with populated data
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });

    console.log(orders);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit Socket.io event if you want real-time updates
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(order.user._id.toString())
        .emit("orderUpdated", order);
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  getProducts,
  deleteProduct,
  updateProductStatus,
  getFeedback,
  updateFeedbackStatus,
  getSalesAnalytics,
  getStoreVisitors,
  softDeleteProduct,
  restoreProduct,
  createProduct,
  updateProduct,
  getProductsByProvider,
  getOrders,
  updateOrderStatus,
};
