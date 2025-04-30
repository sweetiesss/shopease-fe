import React, { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
type Product = {
  id: string;
  name: string;
  description: string;
  image?: string;
  averageRating?: number;
  createdAt: string;
  price?: number;
  featured: boolean;
};

type Category = {
  id: number;
  name: string;
  description: string;
};

export default function ProductPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Selected category ID
  const [searchInput, setSearchInput] = useState(""); // User typing here
  const [searchTerm, setSearchTerm] = useState(""); // Actual search term
  const [sortBy, setSortBy] = useState("Product"); // Backend expects 'createOn'
  const [isCreating, setIsCreating] = useState(false); // Modal visibility
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    featured: false,
  });

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await api.categories.getAll({
        page: 0,
        size: 20,
        sort: "name",
      });
      setCategories(res.content);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch products (all or by category)
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let res;
      if (selectedCategory) {
        // Fetch products by category
        res = await api.products.getByCategory(selectedCategory, {
          page: 0,
          size: 8,
          sort: sortBy,
        });
      } else {
        // Fetch all products
        res = await api.products.getAll({
          page: 0,
          size: 8,
          sort: sortBy,
          search: searchTerm,
        });
      }
      setProducts(res.content);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await api.products.create(newProduct);
      alert("Product created successfully!");
      setIsCreating(false);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product.");
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput); // Trigger the actual search
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId); // Update selected category
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on page load
  }, []);

  useEffect(() => {
    fetchProducts(); // Fetch products when category, sort, or search changes
  }, [selectedCategory, sortBy, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Discover Your Favorites
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Browse our hand-picked collection of premium products crafted just
            for you.
          </p>
        </section>

        <div className="flex gap-8">
          {/* Left: Categories */}
          <aside className="w-1/4 hidden md:block">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)} // Show all products
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    selectedCategory === null
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === category.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right: Products */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              {/* Left: Sort Dropdown */}
              <div className="w-full md:w-1/4">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createOn">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Center: Search Bar */}
              <div className="flex gap-2 w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all"
                >
                  Search
                </button>
              </div>

              {/* Right: Create Product Button (Admin Only) */}
              {user?.role === "ADMIN" && (
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all w-full md:w-auto"
                  >
                    Create Product
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
                isLoading ? "min-h-[400px]" : "" // Ensure a minimum height during loading to prevent layout shift
              }`}
            >
              {isLoading ? (
                // Show skeleton loaders while loading
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex flex-col gap-4 p-4 border rounded-lg shadow-sm bg-white"
                  >
                    <div className="bg-gray-300 h-48 rounded-md" />
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onUpdate={fetchProducts} // Pass fetchProducts as the callback
                  />
                ))
              ) : (
                // No products found
                <div className="col-span-full text-center text-gray-500">
                  No products found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Creating Products */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md"
                />
                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-md"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-md"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.featured}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        featured: e.target.checked,
                      })
                    }
                  />
                  Featured
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
