///////////////////////////////////////////
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "carpet",
    size: "",
    color: "",
    material: "",
    stock: "",
    provider: "",
    images: null,
    style: "",
    pattern: "",
    roomType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key for resetting file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedProvider) params.append("provider", selectedProvider);
        if (showDeleted) params.append("showDeleted", "true");

        const response = await axios.get(
          `http://localhost:5000/api/admin/products?${params.toString()}`,
          { withCredentials: true }
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedProvider, showDeleted]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/providers",
          { withCredentials: true }
        );
        setProviders(response.data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchProviders();
  }, []);

  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId === selectedProvider ? null : providerId);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewProduct({ ...newProduct, images: files });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/products/${productId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } catch (error) {
      console.error("Error changing product status:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "carpet",
        size: "",
        color: "",
        material: "",
        stock: "",
        provider: "",
        images: null,
        style: "",
        pattern: "",
        roomType: "",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleSoftDelete = async (productId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/products/${productId}/soft-delete`,
        {},
        { withCredentials: true }
      );
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Error soft deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      size: product.size,
      color: product.color,
      material: product.material,
      stock: product.stock,
      provider: product.provider._id,
      images: product.images,
      style: product?.style,
      pattern: product?.pattern,
      roomType: product?.roomType,
    });
    setFileInputKey(Date.now()); // Reset file input when editing
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (key === "images" && value) {
          if (Array.isArray(value)) {
            value.forEach((file) => formData.append("images", file));
          } else {
            formData.append("images", value);
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/admin/products/${editingProduct._id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProducts(
        products.map((p) => (p._id === editingProduct._id ? response.data : p))
      );
      setEditingProduct(null);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "carpet",
        size: "",
        color: "",
        material: "",
        stock: "",
        provider: "",
        images: null,
        style: "",
        pattern: "",
        roomType: "",
      });
      setFileInputKey(Date.now());
    } catch (error) {
      console.error("Error updating product:", error);
      // يمكنك إضافة عرض رسالة خطأ للمستخدم هنا
    }
  };
  return (
    <div className="bg-[#D8D2C2] min-h-screen p-8 mt-25">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#4A4947] text-[#D8D2C2] p-6">
          <h1 className="text-3xl font-bold tracking-wide">
            Product Management
          </h1>
        </div>

        {/* Providers Section */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#4A4947]">
            Providers
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleProviderSelect(null)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                !selectedProvider
                  ? "bg-[#4A4947] text-[#D8D2C2]"
                  : "bg-[#D8D2C2] text-[#4A4947] hover:bg-[#4A4947]/10"
              }`}
            >
              All Providers
            </button>
            {providers.map((provider) => (
              <button
                key={provider._id}
                onClick={() => handleProviderSelect(provider._id.toString())}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedProvider === provider._id.toString()
                    ? "bg-[#4A4947] text-[#D8D2C2]"
                    : "bg-[#D8D2C2] text-[#4A4947] hover:bg-[#4A4947]/10"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Form */}
        <form
          onSubmit={editingProduct ? handleUpdate : handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#D8D2C2]/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* حقل الاسم */}
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل الوصف */}
            <div className="flex flex-col">
              <label
                htmlFor="description"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل السعر */}
            <div className="flex flex-col">
              <label
                htmlFor="price"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل الفئة */}
            <div className="flex flex-col">
              <label
                htmlFor="category"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              >
                <option value="carpet">Carpet</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            {/* Enhanced Style Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="style"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Design Style
              </label>
              <div className="relative">
                <select
                  id="style"
                  name="style"
                  value={newProduct.style}
                  onChange={handleInputChange}
                  className="block w-full p-3 pr-8 text-sm text-[#4A4947] bg-white border border-[#D8D2C2] rounded-lg shadow-sm focus:ring-2 focus:ring-[#4A4947]/50 focus:border-[#4A4947]/50 appearance-none"
                >
                  <option value="">Select a design style</option>
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="bohemian">Bohemian</option>
                  <option value="transitional">Transitional</option>
                  <option value="vintage">Vintage</option>
                  <option value="contemporary">Contemporary</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="coastal">Coastal</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#4A4947]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Pattern Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="pattern"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Pattern
              </label>
              <div className="relative">
                <select
                  id="pattern"
                  name="pattern"
                  value={newProduct.pattern}
                  onChange={handleInputChange}
                  className="block w-full p-3 pr-8 text-sm text-[#4A4947] bg-white border border-[#D8D2C2] rounded-lg shadow-sm focus:ring-2 focus:ring-[#4A4947]/50 focus:border-[#4A4947]/50 appearance-none"
                >
                  <option value="">Select a pattern</option>
                  <option value="solid">Solid</option>
                  <option value="geometric">Geometric</option>
                  <option value="floral">Floral</option>
                  <option value="abstract">Abstract</option>
                  <option value="striped">Striped</option>
                  <option value="oriental">Oriental</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#4A4947]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Room Type Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="roomType"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Recommended Room
              </label>
              <div className="relative">
                <select
                  id="roomType"
                  name="roomType"
                  value={newProduct.roomType}
                  onChange={handleInputChange}
                  className="block w-full p-3 pr-8 text-sm text-[#4A4947] bg-white border border-[#D8D2C2] rounded-lg shadow-sm focus:ring-2 focus:ring-[#4A4947]/50 focus:border-[#4A4947]/50 appearance-none"
                >
                  <option value="">Select recommended room</option>
                  <option value="living-room">Living Room</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="dining-room">Dining Room</option>
                  <option value="office">Office</option>
                  <option value="hallway">Hallway</option>
                  <option value="outdoor">Outdoor</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#4A4947]/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            {/* حقل الحجم */}
            <div className="flex flex-col">
              <label
                htmlFor="size"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Size
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={newProduct.size}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل اللون */}

            {/*In your form section, replace the single color input with:*/}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-[#4A4947]">
                Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {newProduct.colors?.map((color, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const updatedColors = [...newProduct.colors];
                        updatedColors[index] = e.target.value;
                        setNewProduct({ ...newProduct, colors: updatedColors });
                      }}
                      className="h-8 w-8 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const updatedColors = [...newProduct.colors];
                        updatedColors[index] = e.target.value;
                        setNewProduct({ ...newProduct, colors: updatedColors });
                      }}
                      className="p-1 border border-[#4A4947]/20 rounded-lg w-24"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedColors = newProduct.colors.filter(
                          (_, i) => i !== index
                        );
                        setNewProduct({ ...newProduct, colors: updatedColors });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setNewProduct({
                      ...newProduct,
                      colors: [...(newProduct.colors || []), "#000000"],
                    });
                  }}
                  className="p-1 text-[#4A4947] hover:bg-[#D8D2C2]/20 rounded"
                >
                  + Add Color
                </button>
              </div>
            </div>
            {/* حقل المادة */}
            <div className="flex flex-col">
              <label
                htmlFor="material"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Material
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={newProduct.material}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل المخزون */}
            <div className="flex flex-col">
              <label
                htmlFor="stock"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              />
            </div>
            {/* حقل المورد */}
            <div className="flex flex-col">
              <label
                htmlFor="provider"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Provider
              </label>
              <select
                id="provider"
                name="provider"
                value={newProduct.provider}
                onChange={handleInputChange}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                required
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            {/* حقل الصور */}
            <div className="flex flex-col">
              <label
                htmlFor="images"
                className="mb-2 text-sm font-medium text-[#4A4947]"
              >
                Images
              </label>
              <input
                key={fileInputKey} // استخدم key لإعادة تعيين حقل الإدخال
                type="file"
                id="images"
                name="images"
                onChange={handleImageUpload}
                className="p-2 border border-[#4A4947]/20 rounded-lg focus:ring-2 focus:ring-[#4A4947]/30 transition-all"
                multiple
                ref={fileInputRef}
              />
            </div>
          </div>
          {/* Form Buttons */}
          <div className="col-span-full flex space-x-4 mt-6">
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-[#4A4947] text-[#D8D2C2] rounded-full hover:bg-[#4A4947]/90 transition-all"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: "",
                    description: "",
                    price: "",
                    category: "carpet",
                    size: "",
                    color: "",
                    material: "",
                    stock: "",
                    provider: "",
                    images: null,
                  });
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset file input
                  }
                }}
                className="flex items-center px-6 py-2 bg-[#D8D2C2] text-[#4A4947] rounded-full hover:bg-[#D8D2C2]/90 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Products Table */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={() => setShowDeleted(!showDeleted)}
                className="form-checkbox text-[#4A4947] rounded"
              />
              <span className="ml-2 text-[#4A4947]">Show Deleted Products</span>
            </label>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A4947]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-[#D8D2C2]/30">
                  <tr>
                    {[
                      "Name",
                      "Price",
                      "Category",
                      "Stock",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="py-3 px-4 text-left text-[#4A4947] font-semibold uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-[#D8D2C2]/10 transition-all duration-300 ${
                        product.isDeleted ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 border-b border-[#4A4947]/10">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 border-b border-[#4A4947]/10">
                        ${product.price}
                      </td>
                      <td className="py-3 px-4 border-b border-[#4A4947]/10 capitalize">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 border-b border-[#4A4947]/10">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 border-b border-[#4A4947]/10">
                        <select
                          value={product.status}
                          onChange={(e) =>
                            handleStatusChange(product._id, e.target.value)
                          }
                          className={`
                            w-full 
                            px-3 py-1 
                            rounded-full 
                            text-xs 
                            font-semibold 
                            border-2 
                            transition-all 
                            duration-300 
                            ${
                              product.status === "approved"
                                ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                                : product.status === "pending"
                                ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                                : "border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
                            }
                            appearance-none 
                            cursor-pointer 
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-opacity-50 
                            ${
                              product.status === "approved"
                                ? "focus:ring-green-300"
                                : product.status === "pending"
                                ? "focus:ring-yellow-300"
                                : "focus:ring-red-300"
                            }
                          `}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 border-b border-[#4A4947]/10 space-x-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-[#4A4947] hover:text-[#4A4947]/70 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          {product.isDeleted ? (
                            <button
                              onClick={() => handleRestore(product._id)}
                              className="text-green-600 hover:text-green-800 transition-all"
                              title="Restore"
                            >
                              <RefreshCw size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(product._id)}
                              className="text-red-600 hover:text-red-800 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
