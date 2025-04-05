// updateProducts.js
const mongoose = require("mongoose");
const Product = require("./models/Product");
const dotenv = require("dotenv");
dotenv.config();
// Connect to your DB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Style mapping based on existing attributes
const getStyleFromExistingData = (product) => {
  // Determine style based on current fields
  if (product.material.includes("wool") || product.material.includes("silk")) {
    return "traditional";
  }
  if (
    product.material.includes("jute") ||
    product.material.includes("seagrass")
  ) {
    return "bohemian";
  }
  if (product.color.includes("gray") || product.color.includes("white")) {
    return "modern";
  }
  // Add more rules as needed
  return "transitional"; // Default
};

// Room type mapping
const getRoomTypeFromExistingData = (product) => {
  if (product.size.includes("large") || product.size.includes("8x10")) {
    return "living-room";
  }
  if (product.size.includes("5x8")) {
    return "living-room";
  }
  if (product.size.includes("6x9")) {
    return "living-room";
  }
  if (product.size.includes("runner")) {
    return "hallway";
  }
  // Add more rules
  return "living-room"; // Default
};

// Pattern mapping
const getPatternFromExistingData = (product) => {
  if (product.name.includes("floral")) {
    return "floral";
  }
  if (product.name.includes("geometric")) {
    return "geometric";
  }
  if (product.name.includes("abstract")) {
    return "abstract";
  }
  if (product.name.includes("oriental")) {
    return "oriental";
  }
  // Add more rules
  return "solid"; // Default
};

const updateAllProducts = async () => {
  try {
    const products = await Product.find({});
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            style: getStyleFromExistingData(product),
            roomType: getRoomTypeFromExistingData(product),
            pattern: getPatternFromExistingData(product),
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOps);
    console.log(`Successfully updated ${bulkOps.length} products`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1);
  }
};

updateAllProducts();
