const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: { userId: req.user.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: "Payment error", error });
  }
};

const createOrder = async (req, res) => {
  try {
    // const user = await User.findById(req.user.id).populate("cart.product");

    // Validate required fields
    const { paymentMethod, shippingAddress } = req.body;
    if (!paymentMethod || !shippingAddress) {
      return res.status(400).json({
        message: "Payment method and shipping address are required",
      });
    }

    const user = await User.findById(req.user.id).populate("cart.product");
    console.log(shippingAddress);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Validate cart items
    const validItems = user.cart.filter(
      (item) =>
        item.product &&
        item.product.status === "approved" &&
        item.quantity <= item.product.stock
    );

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid items in cart" });
    }

    // Calculate total
    const total = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      user: user._id,
      products: validItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        color: item.color,
        size: item.size,
        provider: item.product.provider,
      })),
      shippingAddress: req.body.shippingAddress,
      totalAmount: total * 1.07, // Including tax
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentMethod === "cod" ? "pending" : "completed",
    });

    await order.save();

    // Create payment record if not COD
    if (req.body.paymentMethod !== "cod") {
      const payment = new Payment({
        order: order._id,
        paymentMethod: req.body.paymentMethod,
        amount: order.totalAmount,
        status: "completed",
      });
      await payment.save();
    }

    // Update product stock
    for (const item of validItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the order belongs to the requesting user
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderById,
  createPaymentIntent,
};
