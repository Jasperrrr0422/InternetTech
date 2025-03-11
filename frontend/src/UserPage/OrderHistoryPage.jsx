import { useState, useEffect } from "react";
import { fetchOrders } from "../api"; // Import fetchOrders function

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null); // Error handling
  
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders(); // Call fetchOrders function
        setOrders(data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error("Error fetching orders:", err);
      }
    };

    loadOrders();
  }, []);

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
                <span className="badge bg-success">Finished</span>
                <button className="btn btn-outline-secondary ms-3">Post a review</button>
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