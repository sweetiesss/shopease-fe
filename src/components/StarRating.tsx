import React from "react";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";

type StarRatingProps = {
  rating: number;
  maxStars?: number;
  className?: string;
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  className = "w-5 h-5",
}) => {
  const getStarIcon = (starIndex: number) => {
    if (rating >= starIndex) {
      return "full";
    } else if (rating >= starIndex - 0.5) {
      return "half";
    } else {
      return "empty";
    }
  };

  const renderStar = (type: "full" | "half" | "empty", key: number) => {
    switch (type) {
      case "full":
        return (
          <Star
            key={key}
            className={`${className} fill-yellow-400 text-yellow-400`}
          />
        );
      case "half":
        return (
          <StarHalf
            key={key}
            className={`${className} fill-yellow-400 text-yellow-400`}
          />
        );
      case "empty":
        return <StarEmpty key={key} className={`${className} text-gray-300`} />;
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) =>
        renderStar(getStarIcon(index + 1), index)
      )}
    </div>
  );
};

export default StarRating;
