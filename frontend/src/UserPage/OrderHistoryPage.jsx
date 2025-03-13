import { useState, useEffect } from "react";
import { fetchOrders, cancelOrder, completeOrder, rateOrder } from "../api"; // Import API functions
import { FaStar } from "react-icons/fa"; // Import star icon

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]); // Store orders
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedRatings, setSelectedRatings] = useState({});
  useEffect(() => {
    loadOrders();
  }, []);

  // Fetch order history
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      // Sort orders by latest first (descending order)
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle order cancellation (update status instead of removing)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "canceled" } : order
        )
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order");
    }
  };

  // Handle completing an order (update status to completed)
  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;

    try {
      await completeOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "completed" } : order
        )
      );
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Failed to complete order");
    }
  };

  const handleSelectRating = (orderId, rating) => {
    setSelectedRatings((prev) => ({ ...prev, [orderId]: rating }));
  };

 
  const handlePostRating = async (orderId) => {
    const rating = selectedRatings[orderId];
    if (!rating) return alert("Please select a rating first!");

    try {
      await rateOrder(orderId, rating);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, rating } : order
        )
      );
      alert(`Rating submitted: ${rating}/5`);
      setSelectedRatings((prev) => ({ ...prev, [orderId]: null })); // Clear temporary rating after submission
    } catch (err) {
      console.error("Error rating order:", err);
      alert("Failed to submit rating");
    }
  };


  // Map order status to corresponding Bootstrap badge class
  const getBadgeClass = (status) => {
    switch (status) {
      case "paid":
        return "badge bg-success"; // Green for paid
      case "pending":
        return "badge bg-danger"; // Red for pending
      case "canceled":
        return "badge bg-secondary"; // Gray for canceled
      case "completed":
        return "badge bg-primary"; // Blue for completed
      default:
        return "badge bg-dark"; // Dark for unknown status
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Order History</h2>
      <div className="list-group">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <p>{order.address}</p>
                <p>Check-in Date: {order.check_in_date} - Check-out Date: {order.check_out_date}</p>
              </div>
              <div>
                {/* ✅ Order status with different colors */}
                <span className={getBadgeClass(order.status)}>
                  {order.status.toUpperCase()}
                </span>

                {/* Cancel button - only for paid or pending orders */}
                {order.status === "paid" || order.status === "pending" ? (
                  <button className="btn btn-danger ms-2" onClick={() => handleCancelOrder(order.id)}>
                    Cancel
                  </button>
                ) : null}

                {/* ✅ Complete button - only for paid orders */}
                {order.status === "paid" && (
                  <button className="btn btn-primary ms-2" onClick={() => handleCompleteOrder(order.id)}>
                    Complete
                  </button>
                )}

                {/* ⭐⭐⭐⭐⭐ Rating stars for completed orders */}
                {order.status === "completed" && (
                  <div className="ms-3 d-flex align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className="ms-1"
                        size={24}
                        color={star <= (selectedRatings[order.id] || order.rating || 0) ? "#FFD700" : "#CCCCCC"}
                        onClick={() => handleSelectRating(order.id, star)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                    <span className="ms-2">{selectedRatings[order.id] || order.rating || "Not Rated"}/5</span>
                    {selectedRatings[order.id] && (
                      <button className="btn btn-success ms-2" onClick={() => handlePostRating(order.id)}>
                        Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No available orders</p>
        )}
      </div>
    </div>
  );
}