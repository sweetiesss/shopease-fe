import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Edit, Trash2 } from "react-feather";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

type Product = {
  id: string;
  name: string;
  description: string;
  image?: string;
  averageRating?: number;
  price?: number;
  featured: boolean;
};

type ProductCardProps = {
  product: Product;
  onUpdate: () => void; // Callback to notify parent component
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: product.name,
    description: product.description,
    price: product.price || 0,
    featured: product.featured, // Initialize with the product's current featured status
  });

  const handleUpdate = async () => {
    try {
      await api.products.updateAdmin(product.id, updatedProduct);
      setIsEditing(false);
      onUpdate(); // Notify parent to refresh the product list
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.products.deleteAdmin(product.id);
      setShowDeleteConfirmation(false);
      onUpdate(); // Notify parent to refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const getStarIcon = (averageRating: number, starIndex: number) => {
    if (averageRating >= starIndex) {
      return "full";
    } else if (averageRating >= starIndex - 0.5) {
      return "half";
    } else {
      return "empty";
    }
  };

  const renderStar = (type: "full" | "half" | "empty", key: number) => {
    const baseClass = "w-5 h-5"; // or w-6 h-6 if you prefer
    switch (type) {
      case "full":
        return (
          <Star
            key={key}
            className={`${baseClass} fill-yellow-400 text-yellow-400`}
          />
        );
      case "half":
        return (
          <StarHalf
            key={key}
            className={`${baseClass} fill-yellow-400 text-yellow-400`}
          />
        );
      case "empty":
        return <StarEmpty key={key} className={`${baseClass} text-gray-300`} />;
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md ${
            product.featured
              ? "bg-red-100 hover:bg-red-200"
              : "bg-white hover:bg-gray-100"
          }`}
          title={product.featured ? "Featured Product" : "Mark as Featured"}
        >
          <Heart
            size={18}
            className={product.featured ? "text-red-600" : "text-gray-600"}
          />
        </button>
      </div>
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={updatedProduct.name}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, name: e.target.value })
              }
              className="w-full border rounded-md p-2"
              placeholder="Product Name"
            />
            <textarea
              value={updatedProduct.description}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  description: e.target.value,
                })
              }
              className="w-full border rounded-md p-2"
              placeholder="Product Description"
            />
            <input
              type="number"
              value={updatedProduct.price}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  price: parseFloat(e.target.value),
                })
              }
              className="w-full border rounded-md p-2"
              placeholder="Price"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={updatedProduct.featured}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct,
                      featured: e.target.checked,
                    })
                  }
                />
                Featured
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center mb-2">
              <StarRating rating={product.averageRating || 0} />
              <span className="ml-1 text-xs text-gray-600">
                (
                {product.averageRating ? product.averageRating.toFixed(1) : "0"}
                )
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">
                ${product.price?.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                {user?.role === "ADMIN" && !isEditing && (
                  <>
                    {/* Update Button */}
                    {!showDeleteConfirmation && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-all"
                        title="Update"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {showDeleteConfirmation ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDelete}
                          className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-all"
                          title="Confirm Delete"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
                {/* Shopping Bag Button */}
                {!showDeleteConfirmation && (
                  <Link
                    to={`/product/${product.id}`}
                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors"
                    title="View Product"
                  >
                    <ShoppingBag size={18} />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
