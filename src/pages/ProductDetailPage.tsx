import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const productResponse = await api.products.getById(id);
        setProduct(productResponse.data);

        const ratingResponse = await api.ratings.getByProductId(id);
        setRatings(ratingResponse.content || []);
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

  const getStarIcon = (starIndex: number) => {
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

  const handleReviewSubmit = async () => {
    if (!reviewRating || !reviewText) {
      setSubmitMessage("Please provide a rating and a review.");
      return;
    }

    try {
      await api.ratings.create({
        userId: user?.id,
        productId: Number(id),
        point: reviewRating,
        description: reviewText,
      });

      setSubmitMessage("Thank you for your review!");
      setReviewText("");
      setReviewRating(0);

      // Refresh ratings list
      const ratingResponse = await api.ratings.getByProductId(id!);
      setRatings(ratingResponse.content || []);
    } catch (err: any) {
      setSubmitMessage(err.message || "Error submitting review.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : product ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-700 mb-4">{product.description}</p>
                <p className="text-lg font-semibold mb-4">${product.price}</p>

                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) =>
                    renderStar(getStarIcon(star), star)
                  )}
                  <span className="ml-2 text-gray-600">
                    {averageRating > 0
                      ? `${averageRating.toFixed(1)} (${ratings.length} ${
                          ratings.length === 1 ? "review" : "reviews"
                        })`
                      : "No ratings yet"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
              <div className="mt-10 border-t pt-6">
                <h2 className="text-lg font-semibold mb-6">Write a Review</h2>

                {/* Star Rating */}
                <div className="mb-6 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      {star <= reviewRating ? (
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Text area and button */}
                <div className="flex flex-col">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Write your review here..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-2 resize-none"
                  />

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleReviewSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>

                {submitMessage && (
                  <p className="mt-4 text-sm text-gray-600">{submitMessage}</p>
                )}
              </div>

              {ratings.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b pb-4">
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= rating.point
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 
                            3.292a1 1 0 00.95.69h3.462c.969 0 
                            1.371 1.24.588 1.81l-2.8 
                            2.034a1 1 0 00-.364 
                            1.118l1.07 3.292c.3.921-.755 
                            1.688-1.54 1.118l-2.8-2.034a1 
                            1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 
                            1 0 00-.364-1.118L2.98 
                            8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 
                            0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        ))}
                        <span className="ml-2 font-medium text-gray-900">
                          {rating.userEmail}
                        </span>
                        {rating.createOn && (
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(rating.createOn).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {rating.description && (
                        <p className="text-gray-700">{rating.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Product not found</p>
        )}
      </main>
    </div>
  );
}
