import React, { useState, useEffect } from "react";
import Navbar from "../assets/Components/Navbar";
import { getHotelList } from "../api"; // 复用 API
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    min_price: "",
    max_price: "",
    ordering: "",
    check_in: "",
    check_out: "",
    guests: "",
  });

  // 添加角色检查
  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('access_token');
    
    // 如果已登录，根据角色重定向到对应页面
    if (token && role) {
      setUserRole(role);
      switch (role) {
        case 'admin':
          navigate('/admin');
          return;
        case 'owner':
          navigate('/owner');
          return;
        default:
          // 普通用户可以继续浏览首页
          break;
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchHotels();
  }, [currentPage]); // 当页码改变时，重新获取数据

  const fetchHotels = async () => {
    console.log("Fetching hotels on HomePage with page:", currentPage, "Filters:", filters);
    try {
      const data = await getHotelList(currentPage, 12, filters);
      console.log("Hotel data received:", data);
      setHotels(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchHotels();
  };

  return (
    <div className="homepage-container">
      {/* 传递用户角色给 Navbar */}
      <Navbar user={{ role: userRole }} />

      <div className="container mt-4">
        <h2>Find Your Perfect Stay</h2>

        {/* Search Bar */}
        <div className="row mb-4 search-container">
          <div className="col-3">
            <div className="input-group">
              <span className="input-group-text">Where</span>
              <input
                type="text"
                className="form-control"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search destination"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="col">
            <select className="form-select" name="ordering" value={filters.ordering} onChange={handleFilterChange}>
              <option value="">Sort By</option>
              <option value="price_per_night">Price: Low to High</option>
              <option value="-price_per_night">Price: High to Low</option>
              <option value="created_at">Newest First</option>
              <option value="-created_at">Oldest First</option>
            </select>
          </div>

          <div className="col">
            <input type="date" className="form-control" name="check_in" value={filters.check_in} onChange={handleFilterChange} />
          </div>
          <div className="col">
            <input type="date" className="form-control" name="check_out" value={filters.check_out} onChange={handleFilterChange} />
          </div>
          <div className="col">
            <input type="number" className="form-control" name="guests" value={filters.guests} onChange={handleFilterChange} placeholder="Who" />
          </div>

          <div className="col">
            <button className="btn btn-primary w-100" onClick={handleSearch}>Search</button>
          </div>
        </div>

        {/* Hotel Listings */}
        <div className="row row-cols-1 row-cols-md-3 g-4 listings-container">
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div className="col" key={hotel.id}>
                <Link to={`/hotel/${hotel.id}`} className="text-decoration-none">
                  <div className="card shadow-sm listing-card">
                    <img src={hotel.image} className="card-img-top" alt="Listing" />
                    <div className="card-body">
                      <h5 className="card-title">{hotel.name}</h5>
                      <p className="card-text">{hotel.address}</p>
                      <p className="card-text price">Price: ${hotel.price_per_night}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold rating">⭐ {hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>No hotels found</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls mt-4 d-flex justify-content-center">
          <button className="btn btn-outline-primary me-2" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="mx-3">Page {currentPage} of {totalPages}</span>
          <button className="btn btn-outline-primary" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}