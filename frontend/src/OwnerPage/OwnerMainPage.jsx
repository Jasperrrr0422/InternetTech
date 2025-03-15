import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHotelList, fetchOrders, cancelOrder, completeOrder } from "../api";
import Pagination from "../assets/Components/Pagination";
import HotelList from "../assets/Components/HotelList/HotelList";

export default function HostPage() {
  const [activeTab, setActiveTab] = useState("property");
  const [hotels, setHotels] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 获取订单列表
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

  // 处理订单取消
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

  // 处理订单完成
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

  useEffect(() => {
    const storedOwnerName = localStorage.getItem("username");
    setOwnerName(storedOwnerName || "Owner");
    
    if (activeTab === "property") {
      fetchHotels();
    } else if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab, currentPage]);

  const fetchHotels = async () => {
    try {
      const data = await getHotelList(currentPage, 12);
      setHotels(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const calculateNights = (checkIn, checkOut) => {
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Host Page</h2>
        <h3>Welcome Owner:{ownerName}</h3>
        <input type="text" className="form-control w-25" placeholder="Search..." />
        <button className="btn btn-danger" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="d-flex border-bottom mb-3">
        <button
          className={`btn ${activeTab === "property" ? "btn-primary" : "btn-light"} me-2`}
          onClick={() => setActiveTab("property")}
        >
          Property
        </button>
        <button
          className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-light"}`}
          onClick={() => setActiveTab("orders")}
        >
          Order Record
        </button>
      </div>

      {/* Revenue Display */}
      <div className="d-flex justify-content-between mb-3">
        <h5>Today's Revenue: <span className="text-success">${todayRevenue}</span></h5>
        <h5>Total Revenue: <span className="text-primary">${totalRevenue}</span></h5>
        {activeTab === "property" && (
          <button className="btn btn-secondary" onClick={() => navigate("/ownerupload")}>
            Upload
          </button>
        )}
      </div>

      {/* Content Area */}
      {activeTab === "property" ? (
        <>
          <HotelList hotels={hotels} isOwner={true}/>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : orders.length > 0 ? (
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
                        <p className="mb-1 text-muted">
                          <i className="bi bi-person me-2"></i>
                          Guest ID: {order.user}
                        </p>
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

                    {order.rating && (
                      <div className="mb-3">
                        <p className="mb-1">
                          <i className="bi bi-star-fill text-warning me-2"></i>
                          Guest Rating: {order.rating}/5
                        </p>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      {order.status !== 'completed' && order.status !== 'canceled' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Complete Order
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <h4 className="text-muted">No Orders Available</h4>
                <p className="text-muted">When you receive new orders, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}