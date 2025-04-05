import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { increment } from "../../ProductSlice";
import {
  ShoppingCart,
  Heart,
  Share,
  ArrowLeft,
  Star,
  Check,
  X,
} from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";
import Product3DViewer from "../Product3DViewer";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [addingComment, setAddingComment] = useState(false);
  const imageRef = useRef(null);
  const dispatch = useDispatch();

  // ... [previous useEffect and other methods remain the same]
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/${productId}`
        );
        setProduct(response.data);

        // Set default selections
        if (response.data.colors && response.data.colors.length > 0) {
          setSelectedColor(response.data.colors[0]);
        }

        setTimeout(() => setLoading(false), 800); // Add slight delay for animation
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const addToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color before adding to cart");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          productId,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      if (response.data.success) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error.response?.data || error.message
      );
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
  };

  const handleAddComment = async () => {
    setAddingComment(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/comments`,
        {
          text: newComment,
          rating: newRating,
        },
        {
          withCredentials: true,
        }
      );
      setProduct((prevProduct) => ({
        ...prevProduct,
        comments: [...prevProduct.comments, response.data],
      }));
      setNewComment("");
      setNewRating(5);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setAddingComment(false);
  };

  const isInStock = product?.stock > 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FAF7F0] flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-[#4A4947] border-t-[#D8D2C2] rounded-full"
        />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
        <p className="text-[#4A4947] text-xl">Product not found</p>
      </div>
    );
  }

  // Mock data for missing fields
  const sizes = product.size || ["S", "M", "L", "XL"];
  const colors = product.color || ["#D8D2C2", "#4A4947", "#FAF7F0"];
  const materials = product.material || ["Cotton", "Polyester", "Wool"];
  const stock = product.stock || 5;

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12">
      {/* Notification Component */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-8 right-8 bg-[#4A4947] text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3"
          >
            <Check size={20} weight="bold" />
            <span>Added to cart successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Container with max-width and centered */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-[#4A4947] font-medium hover:underline transition-all"
          >
            <ArrowLeft size={20} weight="bold" className="mr-2" />
            Back to Shop
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Main Product Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={`http://localhost:5000${product.images[selectedImage]}`}
                alt={product.name}
                className="w-full h-[500px] object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <h1 className="text-3xl font-bold text-white">
                  {product.name}
                </h1>
              </div>

              {/* Like Button */}
              <button
                onClick={toggleLike}
                className="absolute top-4 right-4 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <Heart
                  size={24}
                  weight={liked ? "fill" : "regular"}
                  className={liked ? "text-red-500" : "text-[#4A4947]"}
                />
              </button>
            </div>

            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === index ? "ring-2 ring-[#4A4947]" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={`http://localhost:5000${image}`}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* 3D Preview Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-[#4A4947] mb-4">
                3D Preview
              </h3>
              <Product3DViewer
                imageUrl={`http://localhost:5000${product.images[0]}`}
              />
              <p className="text-sm text-[#4A4947]/70 mt-2 text-center">
                Drag to rotate • Scroll to zoom • Click and drag to pan
              </p>
            </div>
          </motion.div>

          {/* Right Column: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-[#4A4947]/70">
                  {product.providerName || "Brand Name"}
                </p>
                <h2 className="text-4xl font-bold text-[#4A4947]">
                  {product.name}
                </h2>
              </div>
              <div className="bg-[#4A4947] text-white text-2xl font-bold px-6 py-3 rounded-xl">
                ${product.price}
              </div>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    weight={
                      star <= (product.rating || 4.5) ? "fill" : "regular"
                    }
                    className="text-amber-500"
                  />
                ))}
              </div>
              <span className="text-[#4A4947]/70">
                {product.likes || 42} reviews
              </span>
            </div>

            {/* Product Description */}
            <div className="prose text-[#4A4947] mb-8">
              <p>{product.description || "Detailed product description..."}</p>
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {/* Color Selection */}
              {/* <div>
                <h3 className="text-sm uppercase tracking-wider text-[#4A4947]/70 mb-3">
                  Color
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full shadow-md relative`}
                  style={{ backgroundColor: colors }}
                  onClick={() => setSelectedColor(colors)}
                >
                  {selectedColor === colors && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check
                        size={20}
                        weight="bold"
                        className="text-white drop-shadow-md"
                      />
                    </div>
                  )}
                </motion.button>
              </div> */}
              {/* Multiple Color Selection */}
              <div>
                <h3 className="text-sm uppercase tracking-wider text-[#4A4947]/70 mb-3">
                  Colors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors?.map((color, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-full shadow-md relative`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={20}
                            weight="bold"
                            className="text-white drop-shadow-md"
                          />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between mb-3">
                  <h3 className="text-sm uppercase tracking-wider text-[#4A4947]/70">
                    Size
                  </h3>
                  <button className="text-sm text-[#4A4947] underline hover:text-[#4A4947]/70">
                    Size Guide
                  </button>
                </div>
                <motion.button
                  whileHover={{ y: -3 }}
                  className={`w-14 h-14 rounded-lg text-[#4A4947] border transition-all ${
                    selectedSize === sizes
                      ? "bg-[#4A4947] text-white"
                      : "bg-white border-[#D8D2C2] hover:border-[#4A4947]"
                  }`}
                  onClick={() => setSelectedSize(sizes)}
                >
                  {sizes}
                </motion.button>
              </div>

              {/* Stock Information */}
              <div className="bg-[#D8D2C2]/30 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      isInStock ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-[#4A4947] font-medium">
                    {isInStock
                      ? `In Stock (${stock} available)`
                      : "Out of Stock"}
                  </p>
                </div>
                <p className="text-[#4A4947]/70 text-sm">
                  Free delivery on orders over $100
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                disabled={!isInStock || !selectedSize || !selectedColor}
                onClick={addToCart}
                className={`flex-1 py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-bold shadow-lg transition-all ${
                  !isInStock || !selectedSize || !selectedColor
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4A4947] hover:bg-[#4A4947]/90"
                }`}
              >
                <ShoppingCart size={20} weight="bold" />
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-white border border-[#D8D2C2] text-[#4A4947] hover:bg-[#D8D2C2]/10 transition-all"
              >
                <Share size={20} weight="bold" />
              </motion.button>
            </div>

            {/* Comments Section */}
            <CommentsSection
              product={product}
              showComments={showComments}
              setShowComments={setShowComments}
              newComment={newComment}
              setNewComment={setNewComment}
              newRating={newRating}
              setNewRating={setNewRating}
              addingComment={addingComment}
              handleAddComment={handleAddComment}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Separate Comments Section Component
const CommentsSection = ({
  product,
  showComments,
  setShowComments,
  newComment,
  setNewComment,
  newRating,
  setNewRating,
  addingComment,
  handleAddComment,
}) => (
  <div>
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={() => setShowComments(!showComments)}
      className="w-full py-3 rounded-lg border border-[#D8D2C2] bg-white shadow-sm text-[#4A4947] flex items-center justify-between px-4 hover:bg-[#D8D2C2]/10 transition-all"
    >
      <span className="font-medium">
        Customer Reviews ({product.comments?.length || 0})
      </span>
      <span
        className={`transform transition-transform ${
          showComments ? "rotate-180" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </span>
    </motion.button>

    <AnimatePresence>
      {showComments && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-4"
        >
          {/* Existing comments */}
          <div className="space-y-4 mb-6">
            {product.comments?.map((comment, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <p className="text-[#4A4947] mb-2">{comment.text}</p>
                <p className="text-sm text-[#4A4947]/70">
                  — {comment.user.name}
                </p>
              </motion.div>
            ))}
          </div>

          {/* New comment form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-[#4A4947] mb-4">
              Add a Comment
            </h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-[#D8D2C2] rounded-lg mb-4"
              placeholder="Write your comment here..."
              rows="4"
            ></textarea>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-[#4A4947]">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    weight={star <= newRating ? "fill" : "regular"}
                    className={`cursor-pointer ${
                      star <= newRating ? "text-amber-500" : "text-[#4A4947]/20"
                    }`}
                    onClick={() => setNewRating(star)}
                  />
                ))}
              </div>

              <button
                onClick={handleAddComment}
                disabled={addingComment || !newComment}
                className={`px-6 py-2 rounded-lg text-white font-bold shadow-lg transition-all ${
                  addingComment
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4A4947] hover:bg-[#4A4947]/90"
                }`}
              >
                {addingComment ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ProductDetails;
