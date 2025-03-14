import RatingStars from "./RatingStars";
 // Import CSS file

export default function OrderItem({ order, onCancel, onComplete, onRate, selectedRating, setSelectedRating }) {
  // Order status badge class mapping
  const getBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "badge bg-success"; // Green
      case "pending":
        return "badge bg-danger"; // Red
      case "canceled":
        return "badge bg-secondary"; // Gray
      case "completed":
        return "badge bg-primary"; // Blue
      default:
        return "badge bg-dark"; // Default color
    }
  };

  return (
    <div className="order-card card shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div className="order-info">
          <h3>{order.hotel_name}</h3>
          <p className="text-muted">{order.hotel_address}</p>
          <p>Check-in: <strong>{order.check_in_date}</strong> - Check-out: <strong>{order.check_out_date}</strong></p>
        </div>

        <div className="order-actions">
          {/* Order status */}
          <span className={`order-status ${getBadgeClass(order.status)}`}>{order.status.toUpperCase()}</span>

          {/* Cancel button */}
          {(order.status === "paid" || order.status === "pending") && (
            <button className="btn btn-danger ms-2" onClick={() => onCancel(order.id)}>
              Cancel
            </button>
          )}

          {/* Complete button */}
          {order.status === "paid" && (
            <button className="btn btn-primary ms-2" onClick={() => onComplete(order.id)}>
              Complete
            </button>
          )}

          {/* Rating component for completed orders */}
          {order.status === "completed" && (
            <RatingStars
              orderId={order.id}
              rating={order.rating}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              onRate={onRate}
            />
          )}
        </div>
      </div>
    </div>
  );
}