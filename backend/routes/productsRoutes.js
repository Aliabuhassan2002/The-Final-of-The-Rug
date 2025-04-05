const express = require("express");
const Product = require("../models/Product");
const verifyToken = require("../middlewares/verifyToken");
const {
  getApprovedProducts,
  getProductById,
} = require("../controllers/productsController");
const { addComment } = require("../controllers/commentController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/approved", getApprovedProducts);

// Fetch a single product by its ID
router.get("/:productId", getProductById);
router.post("/:productId/comments", verifyToken, addComment);

// Adding a new product by provider
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Add product with image upload
// router.post(
//   "/add",
//   verifyToken,
//   upload.array("images", 5),
//   async (req, res) => {
//     try {
//       if (req.user.role !== "provider") {
//         return res
//           .status(403)
//           .json({ message: "Only providers can add products." });
//       }

//       const {
//         name,
//         description,
//         price,
//         category,
//         size,
//         color,
//         material,
//         stock,
//       } = req.body;

//       Get file paths for uploaded images
//       const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

//       const newProduct = new Product({
//         name,
//         description,
//         price,
//         category,
//         size,
//         color,
//         material,
//         provider: req.user.id,
//         images: imagePaths, // Store image paths in database
//         stock,
//       });

//       const savedProduct = await newProduct.save();
//       res.status(201).json(savedProduct);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error });
//     }
//   }
// );
router.post(
  "/add",
  verifyToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (req.user.role !== "provider") {
        return res
          .status(403)
          .json({ message: "Only providers can add products." });
      }

      const {
        name,
        description,
        price,
        category,
        size,
        material,
        stock,
        style,
        roomType,
        pattern,
        color,
      } = req.body;

      // معالجة الألوان (تأتي كمصفوفة من req.body)
      const colors = Array.isArray(req.body.colors)
        ? req.body.colors
        : [req.body.colors];

      // Get file paths for uploaded images
      const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

      const newProduct = new Product({
        name,
        description,
        price,
        category,
        size,
        colors, // تم تغييرها من color إلى colors
        material,
        style,
        roomType,
        pattern,
        provider: req.user.id,
        images: imagePaths,
        stock,
        color: "#000",
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error details:", error); // سجل الخطأ بالتفصيل
      res.status(500).json({
        message: "Server error",
        error: error.message,
        stack: error.stack,
      });
    }
  }
);
// Serve static files from the uploads folder
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Fetch all products of a specific provider
router.get("/provider/:providerId", async (req, res) => {
  try {
    const products = await Product.find({ provider: req.params.providerId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
