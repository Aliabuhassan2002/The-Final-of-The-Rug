const Comment = require("../models/Comments");
const Product = require("../models/Product");
const User = require("../models/User");

const addComment = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    const newComment = new Comment({
      user: userId,
      product: productId,
      text,
      rating,
    });

    const savedComment = await newComment.save();

    // Add comment to product's comments array
    await Product.findByIdAndUpdate(productId, {
      $push: { comments: savedComment._id },
    });

    // Populate the user information for the saved comment
    const populatedComment = await savedComment.populate("user", "name");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

module.exports = { addComment };
