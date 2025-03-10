import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HostPage() {
  const [activeTab, setActiveTab] = useState("property");
  const [properties, setProperties] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const ownerId = localStorage.getItem("owner_id"); 
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate("/ownerupload")
  }
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Host Page</h2>
        <input type="text" className="form-control w-25" placeholder="Search..." />
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
        <button className="btn btn-secondary" onClick={handleUpload}>Upload</button>
      </div>

      {/* Content Area */}
      <div className="content">
        {activeTab === "property" ? (
          <div>
            <h4>My Properties</h4>
            {properties.length > 0 ? (
              <div className="row">
                {properties.map((property) => (
                  <div key={property.id} className="col-md-4 mb-3">
                    <div className="card shadow-sm">
                      <img src={property.image_url} alt="Property" className="card-img-top" />
                      <div className="card-body">
                        <h5 className="card-title">{property.name}</h5>
                        <p>{property.address}</p>
                        <p>Price per night: <strong>${property.price_per_night}</strong></p>
                        <button className="btn btn-warning">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No properties found</p>
            )}
          </div>
        ) : (
          <div>
            <h4>Order Records</h4>
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}