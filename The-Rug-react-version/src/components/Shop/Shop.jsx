import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ShoppingCart } from "phosphor-react";
import ProductImage from "./ProductImage";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/products/approved"
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId, quantity: 1 },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      if (response.data.success) {
        alert(response.data.message);
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
  if (loading) {
    return <div className="text-center py-20">Loading products...</div>;
  }

  return (
    <div className="bg-gradient-to-b from-[#FAF7F0] to-[#D8D2C2] py-16 px-4 sm:px-6 lg:px-8 pt-35">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-[#4A4947] relative">
        <span className="relative z-10 px-6">Our Products</span>
        <span className="absolute inset-x-0 bottom-2 h-3 bg-[#FAF7F0] transform -skew-x-12"></span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product._id}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 hover:shadow-2xl hover:-translate-y-2"
            style={{
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(74, 73, 71, 0.1)",
              background: "linear-gradient(135deg, #FAF7F0 0%, #D8D2C2 100%)",
            }}
          >
            {/* Product Image */}
            <div className="relative aspect-square">
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Information */}
            <div className="p-6 relative z-10 bg-white/70 backdrop-blur-md">
              <Link to={`/details/${product.id}`} className="block">
                <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-[#4A4947]">
                  {product.name}
                </h3>
              </Link>

              {/* Product attributes container */}
              <div className="flex flex-wrap gap-2 my-3">
                {[
                  { value: product.material, icon: "🧶" },
                  { value: product.pattern, icon: "✨" },
                  { value: product.roomType, icon: "🏠" },
                  { value: product.style, icon: "🎨" },
                ]
                  .filter((attr) => attr.value)
                  .map((attr, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FAF7F0] text-[#4A4947] border border-[#D8D2C2]"
                    >
                      <span className="mr-1">{attr.icon}</span>
                      {attr.value}
                    </span>
                  ))}
              </div>

              <p className="text-2xl font-bold text-[#4A4947] mt-3">
                {product.price} JD
              </p>

              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => addToCart(product.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A4947] text-white hover:bg-[#D8D2C2] hover:text-[#4A4947] transition-all duration-300"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
