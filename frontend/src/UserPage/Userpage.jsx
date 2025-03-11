import Navbar from "../assets/Components/Navbar";
import { useState, useEffect } from "react";
import { getHotelList } from "../api";
import HotelList from "../assets/Components/HotelList/HotelList";
import Pagination from "../assets/Components/Pagination";
export default function UserPage() {
  // State variables for user data, hotels, pagination, and filters
  const [username, setUsername] = useState("");
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false); // Toggle filter dropdown

  // Filter options for search
  const [filters, setFilters] = useState({
    q: "", // Search query
    min_price: "",
    max_price: "",
    ordering: "", // Sorting option
    check_in: "",
    check_out: "",
    guests: "",
  });

  // Get username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
  }, []);

  // Fetch hotels when the page changes
  useEffect(() => {
    fetchHotels();
  }, [currentPage]);

  // Fetch hotel list from API
  const fetchHotels = async () => {
    console.log("Fetching hotels with page:", currentPage, "Filters:", filters);

    try {
      const data = await getHotelList(currentPage, 12, filters);
      console.log("Hotel data received:", data);

      setHotels(data.data || []);

      // Ensure pagination exists, otherwise set default total pages to 1
      const pages = data.pagination?.total_pages || 1;
      console.log("Total Pages:", pages);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  // Handle filter input change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Trigger search and reset page to 1
  const handleSearch = () => {
    setCurrentPage(1);
    fetchHotels();
  };

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="homepage-container">
      <Navbar user={username}/>
      <div className="container mt-4">
        <h2>Welcome, {username}!</h2>

        {/* Search Bar */}
        <div className="row mb-4 search-container">
          {/* Search Destination */}
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

          {/* Sorting Options */}
          <div className="col">
            <select
              className="form-select"
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
            >
              <option value="">Sort By</option>
              <option value="price_per_night">Price: Low to High</option>
              <option value="-price_per_night">Price: High to Low</option>
              <option value="created_at">Newest First</option>
              <option value="-created_at">Oldest First</option>
            </select>
          </div>

          {/* Date Pickers and Guests */}
          <div className="col">
            <input
              type="date"
              className="form-control"
              name="check_in"
              value={filters.check_in}
              onChange={handleFilterChange}
              placeholder="Check in"
            />
          </div>
          <div className="col">
            <input
              type="date"
              className="form-control"
              name="check_out"
              value={filters.check_out}
              onChange={handleFilterChange}
              placeholder="Check out"
            />
          </div>
          <div className="col">
            <input
              type="number"
              className="form-control"
              name="guests"
              value={filters.guests}
              onChange={handleFilterChange}
              placeholder="Who"
            />
          </div>

          {/* Filter Button (Dropdown) */}
          <div className="col">
            <button className="btn btn-secondary w-100" onClick={() => setShowFilter(!showFilter)}>
              Filter ▼
            </button>
          </div>

          {/* Search Button */}
          <div className="col">
            <button className="btn btn-primary w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Price Filter (Only visible when filter dropdown is open) */}
        {showFilter && (
          <div className="row mb-4">
            <div className="col">
              <input
                type="number"
                className="form-control"
                name="min_price"
                value={filters.min_price}
                onChange={handleFilterChange}
                placeholder="Min Price"
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                name="max_price"
                value={filters.max_price}
                onChange={handleFilterChange}
                placeholder="Max Price"
              />
            </div>
          </div>
        )}

        {/* Hotel Listings */}
         <HotelList hotels={hotels} />
        {/* Pagination Controls */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}