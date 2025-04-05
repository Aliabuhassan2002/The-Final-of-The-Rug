import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, CreditCard, Truck } from "lucide-react";
import axios from "axios";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/cart", {
        withCredentials: true,
      });
      setCartItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        withCredentials: true,
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbe7c6]/20 pt-35">
      <div className="max-w-7xl mx-auto p-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-[#d4a373]" />
          <h1 className="text-3xl font-bold text-gray-800">
            Your Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Your cart is empty</p>
            <Link
              to="/shop"
              className="mt-4 inline-block text-[#d4a373] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Products Section */}
            <div className="lg:w-2/3 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex gap-6 p-6">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-[#fbe7c6]/30">
                      <img
                        src={`http://localhost:5000${item.product.images[0]}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        alt={item.product.name}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Price: {item.product.price} JD
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 rounded-full bg-[#fbe7c6] hover:bg-[#d4a373] transition-colors duration-300 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="font-bold text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 rounded-full bg-[#fbe7c6] hover:bg-[#d4a373] transition-colors duration-300 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold text-gray-800">
                        {(item.product.price * item.quantity).toFixed(2)} JD
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="mt-4 text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Section */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-[#d4a373]" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-lg">
                      {total.toFixed(2)} JD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Shipping</span>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#d4a373]" />
                      <span className="font-bold text-lg">Free</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Tax (7%)</span>
                    <span className="font-bold text-lg">
                      {(total * 0.07).toFixed(2)} JD
                    </span>
                  </div>
                </div>

                <div className="bg-[#fbe7c6]/30 p-6 rounded-lg mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-800">
                      {(total * 1.07).toFixed(2)} JD
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full text-center bg-[#d4a373] text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-[#ab815c] hover:shadow-lg transform hover:-translate-y-1"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-center text-gray-500 mt-6 text-sm">
                  Free shipping on all orders
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
