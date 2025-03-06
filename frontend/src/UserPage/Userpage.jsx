import Navbar from "../assets/Components/Navbar";
import { useState, useEffect } from "react";
import { getHotelList } from "../api";

export default function UserPage() {
  const [username, setUsername] = useState("");
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [currentPage]); // 依赖 currentPage，每次变化时自动重新获取数据

  const fetchHotels = async () => {
    console.log("Fetching hotels with page:", currentPage, "and pageSize:", 12);

    try {
      const data = await getHotelList(currentPage, 12);
      console.log("Hotel data received:", data);

      setHotels(data.data || []);

      // ✅ 确保 pagination 存在，否则默认设置 totalPages = 1
      const pages = data.pagination?.total_pages || 1;
      console.log("Total Pages:", pages);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
};

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1); // ✅ 触发 useEffect
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1); // ✅ 触发 useEffect
    }
  };

  return (
    <div className="homepage-container">
      <Navbar />
      <div className="container mt-4">
        <h2>Welcome, {username}!</h2>

        {/* 酒店列表 */}
        <div className="row row-cols-1 row-cols-md-3 g-4 listings-container">
          {Array.isArray(hotels) && hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div className="col" key={hotel.id}>
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
              </div>
            ))
          ) : (
            <p>No hotels found</p>
          )}
        </div>

        {/* 分页控制 */}
        <div className="pagination-controls mt-4 d-flex justify-content-center">
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="mx-3">Page {currentPage} of {totalPages}</span>
          <button 
            className="btn btn-outline-primary" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}