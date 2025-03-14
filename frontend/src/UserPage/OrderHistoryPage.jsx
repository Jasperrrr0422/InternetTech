import { useState, useEffect } from "react";
import { fetchOrders, cancelOrder, completeOrder, rateOrder } from "../api"; // Import API functions
import { useNavigate } from "react-router-dom";
import OrderItem from "../assets/Components/OrderItem";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]); // Store orders
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedRatings, setSelectedRatings] = useState({}); // Track new ratings
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  // Fetch order history
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: "canceled" } : order))
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order");
    }
  };

  // Handle completing an order
  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;

    try {
      await completeOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: "completed" } : order))
      );
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Failed to complete order");
    }
  };

  // Handle rating an order
  const handlePostRating = async (orderId, rating) => {
    if (!rating) return alert("Please select a rating first!");

    try {
      await rateOrder(orderId, rating);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, rating } : order))
      );
      alert(`Rating submitted: ${rating}/5`);
    } catch (err) {
      console.error("Error rating order:", err);
      alert("Failed to submit rating");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Order History</h2>
        <button className="btn btn-outline-danger" onClick={() => navigate("/userpage")}>
          Return to Home
        </button>
      </div>

      <div className="list-group">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onCancel={handleCancelOrder}
              onComplete={handleCompleteOrder}
              onRate={handlePostRating}
              selectedRating={selectedRatings}
              setSelectedRating={setSelectedRatings}
            />
          ))
        ) : (
          <p>No available orders</p>
        )}
      </div>
    </div>
  );
}