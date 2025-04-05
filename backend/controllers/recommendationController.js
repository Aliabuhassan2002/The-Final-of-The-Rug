// controllers/recommendationController.js
const Product = require("../models/Product");
const User = require("../models/User");

// Simple content-based filtering
const getStyleRecommendations = async (req, res) => {
  try {
    const { preferredStyles, roomType, colorScheme } = req.body;

    // Basic matching algorithm
    const query = {
      status: "approved",
      $or: [
        { style: { $in: preferredStyles } },
        { roomType: roomType },
        { colors: { $in: colorScheme } },
      ],
    };

    const recommendations = await Product.find(query)
      .limit(12)
      .populate("provider", "name");

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Error generating recommendations" });
  }
};

// Personalized recommendations based on user history
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate("likedProducts")
      .populate("cart.product");

    // Extract preferences from user history
    const likedStyles = [...new Set(user.likedProducts.map((p) => p.style))];
    const cartStyles = [...new Set(user.cart.map((i) => i.product.style))];

    const preferredStyles = [...likedStyles, ...cartStyles];
    const uniqueStyles = [...new Set(preferredStyles)];

    // Fallback to popular items if no preferences
    if (uniqueStyles.length === 0) {
      const popularItems = await Product.find({ status: "approved" })
        .sort({ likes: -1 })
        .limit(12)
        .populate("provider", "name");
      return res.json(popularItems);
    }

    const recommendations = await Product.find({
      status: "approved",
      style: { $in: uniqueStyles },
    })
      .limit(12)
      .populate("provider", "name");

    res.json(recommendations);
  } catch (error) {
    console.error("Personalized recommendation error:", error);
    res
      .status(500)
      .json({ message: "Error generating personalized recommendations" });
  }
};

module.exports = {
  getStyleRecommendations,
  getPersonalizedRecommendations,
};
