import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import { Star, StarHalf, Star as StarEmpty, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type Rating = {
  id: number;
  userEmail: string;
  productName: string;
  point: number;
  description: string;
  createOn: string | null;
};

type Category = {
  id: number;
  name: string;
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submitMessage, setSubmitMessage] = useState("");
  const { user } = useAuth();
  const [ratingError, setRatingError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [categories, setCategories] = useState<Category[] | null>(null); // State for categories

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const productResponse = await api.products.getById(id);
        setProduct(productResponse.data);

        const ratingResponse = await api.ratings.getByProductId(id);
        setRatings(ratingResponse.content || []);

        // Fetch categories for the product
        try {
          const categoryResponse = await api.categories.getByProductId(id);
          setCategories(categoryResponse.categories || []);
        } catch {
          setCategories(null); // Handle cases where no categories are returned
        }
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.point, 0) / ratings.length
      : 0;

  const handleReviewSubmit = async () => {
    setRatingError("");
    setCommentError("");
    setSubmitMessage("");

    let hasError = false;

    if (!reviewRating) {
      setRatingError("Please select a star rating.");
      hasError = true;
    }

    if (!reviewText.trim()) {
      setCommentError("Please write a comment.");
      hasError = true;
    }

    if (hasError) return;

    try {
      // Check if it's an update or a new review
      const existingRating = ratings.find(
        (rating) => rating.userEmail === user?.email
      );

      if (existingRating) {
        // Update existing review
        await api.ratings.update(existingRating.id, {
          point: reviewRating,
          description: reviewText,
        });
        setSubmitMessage("Review updated successfully.");
      } else {
        // Create new review
        await api.ratings.create({
          userId: user?.id,
          productId: Number(id),
          point: reviewRating,
          description: reviewText,
        });
        setSubmitMessage("Thank you for your review!");
      }

      // Refresh ratings list
      const ratingResponse = await api.ratings.getByProductId(id!);
      setRatings(ratingResponse.content || []);
      setReviewText("");
      setReviewRating(0);
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitMessage("Error submitting review.");
    }
  };

  const handleCancel = () => {
    setReviewText("");
    setReviewRating(0);
    setRatingError("");
    setCommentError("");
    setSubmitMessage("");
  };

  const handleUpdateClick = (rating: Rating) => {
    setReviewText(rating.description);
    setReviewRating(rating.point);
    setSubmitMessage("");
    setRatingError("");
    setCommentError("");
  };

  const handleDeleteClick = async (ratingId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.ratings.delete(ratingId);
      setRatings((prevRatings) =>
        prevRatings.filter((rating) => rating.id !== ratingId)
      );
      setSubmitMessage("Review deleted successfully.");
    } catch (err) {
      console.error("Error deleting review:", err);
      setSubmitMessage("Error deleting review.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10">
        {isLoading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : error ? (
          <div className="text-red-600 text-center text-lg">{error}</div>
        ) : product ? (
          <div className="space-y-12">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>

                <div className="flex items-center">
                  <StarRating rating={averageRating} />
                  <span className="ml-3 text-sm text-gray-600">
                    {averageRating > 0
                      ? `${averageRating.toFixed(1)} (${ratings.length} ${
                          ratings.length === 1 ? "review" : "reviews"
                        })`
                      : "No ratings yet"}
                  </span>
                </div>

                <p className="text-2xl font-semibold text-blue-600">
                  ${product.price}
                </p>

                <p className="text-gray-700 text-lg">{product.description}</p>

                {/* Categories */}
                {categories && categories.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={category.id}
                          className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm hover:bg-indigo-200 transition-colors"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No categories available</p>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Customer Reviews
              </h2>

              {/* Review Form */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Write a Review
                </h3>

                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingError && (
                  <p className="text-red-500 text-sm">{ratingError}</p>
                )}

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts..."
                  className="w-full mt-2 border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                />
                {commentError && (
                  <p className="text-red-500 text-sm mt-1">{commentError}</p>
                )}

                <div className="text-right mt-3 space-x-4">
                  {/* Cancel Button */}
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md text-sm"
                  >
                    Cancel
                  </button>

                  {/* Submit Button */}
                  <button
                    onClick={handleReviewSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
                  >
                    Submit Review
                  </button>
                </div>

                {submitMessage && (
                  <p className="mt-4 text-sm text-green-600">{submitMessage}</p>
                )}

                {/* No reviews message here */}
                {ratings.length === 0 && (
                  <p className="text-gray-500 text-sm mt-6">No reviews yet.</p>
                )}
              </div>

              {/* Reviews List */}
              {ratings.length > 0 && (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="bg-white shadow-sm p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <StarRating rating={rating.point} />
                        </div>

                        {/* Update and Delete Buttons */}
                        {(user?.role === "ADMIN" ||
                          user?.email === rating.userEmail) && (
                          <div className="flex gap-2">
                            {/* Update Button */}
                            <button
                              onClick={() => handleUpdateClick(rating)}
                              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                              Update
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(rating.id)}
                              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700">{rating.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">Product not found</p>
        )}
      </main>
    </div>
  );
}
