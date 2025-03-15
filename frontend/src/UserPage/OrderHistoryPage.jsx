import { useState, useEffect } from "react";
import { fetchOrders, cancelOrder, completeOrder, rateOrder } from "../api"; // Import API functions
import { useNavigate } from "react-router-dom";

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
    if (!rating) {
      alert("Please select a rating first!");
      return;
    }

    try {
      await rateOrder(orderId, rating);
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, rating } : order))
      );
      setSelectedRatings((prev) => ({ ...prev, [orderId]: undefined }));
      alert(`Rating submitted: ${rating}/5`);
    } catch (err) {
      console.error("Error rating order:", err);
      alert("Failed to submit rating");
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-clock-history me-2"></i>
          Order History
        </h2>
        <button className="btn btn-outline-primary" onClick={() => navigate("/userpage")}>
          <i className="bi bi-arrow-left me-2"></i>
          Return to Home
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      ) : orders.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="list-group">
              {orders.map((order) => (
                <div key={order.id} className="list-group-item list-group-item-action">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-1">
                        Order #{order.id}
                        <span className={`badge ms-2 ${
                          order.status === 'completed' ? 'bg-success' :
                          order.status === 'canceled' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </h5>
                      <small className="text-muted">
                        <i className="bi bi-clock me-2"></i>
                        Ordered on: {new Date(order.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-1">£{order.total_price}</h5>
                      <small className="text-muted">
                        {calculateNights(order.check_in_date, order.check_out_date)} nights
                      </small>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <i className="bi bi-calendar3 me-2"></i>
                        Check-in: {new Date(order.check_in_date).toLocaleDateString()}
                      </p>
                      <p className="mb-1">
                        <i className="bi bi-calendar3 me-2"></i>
                        Check-out: {new Date(order.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1">
                        <i className="bi bi-house me-2"></i>
                        {order.hotel_name}
                      </p>
                      <p className="mb-1">
                        <i className="bi bi-geo-alt me-2"></i>
                        {order.hotel_address}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                      {order.status !== 'completed' && order.status !== 'canceled' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Complete Stay
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel Order
                          </button>
                        </>
                      )}
                    </div>
                    
                    {order.status === 'completed' && !order.rating && (
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn-group">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              className={`btn btn-outline-warning btn-sm ${
                                selectedRatings[order.id] === rating ? 'active' : ''
                              }`}
                              onClick={() => setSelectedRatings({ ...selectedRatings, [order.id]: rating })}
                            >
                              {rating} ⭐
                            </button>
                          ))}
                        </div>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handlePostRating(order.id, selectedRatings[order.id])}
                        >
                          <i className="bi bi-star-fill me-2"></i>
                          Rate Stay
                        </button>
                      </div>
                    )}
                    
                    {order.rating && (
                      <div className="text-warning">
                        <i className="bi bi-star-fill me-2"></i>
                        Rated: {order.rating}/5
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted">No Orders Yet</h4>
          <p className="text-muted">Your order history will appear here once you make a booking.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            <i className="bi bi-search me-2"></i>
            Browse Hotels
          </button>
        </div>
      )}
    </div>
  );
}