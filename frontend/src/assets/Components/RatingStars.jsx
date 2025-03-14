import { FaStar } from "react-icons/fa";

export default function RatingStars({ orderId, rating, selectedRating, setSelectedRating, onRate }) {
  const isRated = rating !== undefined && rating !== null; // Check if already rated

  return (
    <div className="ms-3 d-flex align-items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={24}
          color={star <= (selectedRating[orderId] || rating || 0) ? "#FFD700" : "#CCCCCC"}
          onClick={() => {
            if (!isRated) { // Prevent rating modification
              setSelectedRating((prev) => ({ ...prev, [orderId]: star }));
            }
          }}
          style={{ cursor: isRated ? "default" : "pointer" }}
        />
      ))}
      <span className="ms-2">{selectedRating[orderId] || rating || "Not Rated"}/5</span>

      {/* Show "Post" button only if a new rating is selected */}
      {selectedRating[orderId] && !isRated && (
        <button className="btn btn-success ms-2" onClick={() => onRate(orderId, selectedRating[orderId])}>
          Post
        </button>
      )}
    </div>
  );
}