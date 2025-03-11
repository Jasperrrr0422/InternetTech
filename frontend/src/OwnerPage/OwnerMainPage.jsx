import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHotelList } from "../api";
import Pagination from "../assets/Components/Pagination";
import HotelList from "../assets/Components/HotelList/HotelList";

export default function HostPage() {
  const [activeTab, setActiveTab] = useState("property");
  const [properties, setProperties] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [ownerName, setOwnerName] = useState(""); // State for owner's name
  const [filters, setFilters] = useState({
    q: "", // Search query
    min_price: "",
    max_price: "",
    ordering: "", // Sorting option
    check_in: "",
    check_out: "",
    guests: "",
  });
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate("/ownerupload");
  };

  // **Fetch the owner name from localStorage**
  useEffect(() => {
    const storedOwnerName = localStorage.getItem("username");
    setOwnerName(storedOwnerName || "Owner");
    fetchHotels();
  }, [currentPage]);

  // **Fetch hotels based on filters and current page**
  const fetchHotels = async () => {
    try {
      const data = await getHotelList(currentPage, 12, filters);
      setHotels(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  // **Logout function**
  const handleLogout = () => {
    localStorage.clear(); // Clear the localStorage
    window.location.href = "/"; // Redirect to the homepage
  };

  return (
    <div className="container mt-4">
      
     
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Host Page</h2>
        <span>Welcome, {ownerName}</span> {/* Display owner name */}
        <input type="text" className="form-control w-25" placeholder="Search..." />
        {/* Logout Button */}
    
        <button className="btn btn-danger" href="#" onClick={handleLogout}>
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
        <button className="btn btn-secondary" onClick={handleUpload}>Upload</button>
      </div>

      {/* Content Area */}
      <HotelList hotels={hotels} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}