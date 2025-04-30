import Footer from "../components/Footer";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight, Search, ArrowRight } from "react-feather";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import StarRating from "../components/StarRating";

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

type CategoryResponse = {
  content: Category[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredProducts.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredProducts]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.products.getFeatured({
        page: 0,
        size: 8,
        sort: "createOn",
      });

      if (data.content.length > 0) {
        setFeaturedProducts(
          data.content.slice(0, Math.min(5, data.content.length))
        );
        const sorted = [...data.content].sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
        );
        setPopularProducts(sorted.slice(0, 8));
      } else {
        setFeaturedProducts([]);
        setPopularProducts([]);
      }
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.categories.getAll({
        page: 0,
        size: 8,
        sort: "id",
      });
      setCategories(response.content);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const handleCategoryClick = (categoryId: number) => {
    // Redirect to ProductPage with the selected category ID as a query parameter
    navigate(`/products?category=${categoryId}`);
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section with Carousel */}
      <section className="relative bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="relative overflow-hidden" ref={carouselRef}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <div className="relative h-[500px] md:h-[600px] w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center z-20">
                      <div className="container mx-auto px-4 md:px-8">
                        <div className="max-w-lg text-white">
                          <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {product.name}
                          </h1>
                          <p className="text-lg mb-6">{product.description}</p>
                          <div className="flex items-center mb-6">
                            <StarRating rating={product.averageRating || 0} />
                            <span className="ml-2 text-sm">
                              {product.averageRating
                                ? product.averageRating.toFixed(1)
                                : "No ratings"}
                            </span>
                          </div>
                          <div className="text-2xl font-bold mb-6">
                            ${product.price?.toFixed(2)}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            View Product{" "}
                            <ArrowRight className="ml-2" size={18} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-30 hover:bg-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-30 hover:bg-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentSlide === index ? "bg-white" : "bg-white/50"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-100">
            <p className="text-gray-500">No featured products available</p>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Shop by Category
          </h2>

          {isLoadingCategories ? (
            <div className="flex items-center justify-center h-64">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)} // Handle category click
                  className="flex flex-col items-center justify-between h-48 p-6 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-indigo-700 text-xl font-semibold mb-2 capitalize truncate">
                      {category.name}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdate={fetchProducts} // Pass fetchProducts as the callback
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
