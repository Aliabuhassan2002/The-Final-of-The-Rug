const Product = require("../models/Product");

const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "approved",
      isDeleted: false,
    }).populate("provider", "name");
    const formattedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0], // assuming the first image is the main image
      providerName: product.provider?.name, // ensure provider name is added properly
      style: product?.style,
      material: product.material,
      pattern: product.pattern,
      roomType: product.roomType,
    }));
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching approved products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.productId).populate(
//       "provider",
//       "name"
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json(product);
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     res.status(500).json({ message: "Failed to fetch product" });
//   }
// };
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("provider", "name")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name",
        },
      });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};
module.exports = { getApprovedProducts, getProductById };
