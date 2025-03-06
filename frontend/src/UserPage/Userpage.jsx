import Navbar from "../assets/Components/Navbar";
import { useState, useEffect } from "react";
import { getHotelList } from "../api";

export default function UserPage() {
  const [username, setUsername] = useState("");
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("access_token");
    setUsername(storedUsername);
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const data = await getHotelList({ page: 1, pageSize: 12 });
      setHotels(data.results);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  return (
    <div className="homepage-container">
      <Navbar />
      <div className="container mt-4">
        <h2>Welcome, {username}!</h2>
        <div className="row mb-4 search-container">
          <div className="col">
            <div className="input-group">
              <span className="input-group-text">Where</span>
              <input type="text" className="form-control" placeholder="Search destination" />
            </div>
          </div>
          <div className="col"><input type="date" className="form-control" placeholder="Check in" /></div>
          <div className="col"><input type="date" className="form-control" placeholder="Check out" /></div>
          <div className="col"><input type="number" className="form-control" placeholder="Who" /></div>
          <div className="col"><button className="btn btn-primary w-100">Search</button></div>
        </div>

        <div className="row row-cols-1 row-cols-md-3 g-4 listings-container">
          {hotels.length === 0 ? (
            <p>No hotels found</p>
          ) : (
            hotels.map((hotel) => (
              <div className="col" key={hotel.id}>
                <div className="card shadow-sm listing-card">
                  <img src={hotel.image_url || "https://via.placeholder.com/150"} className="card-img-top" alt="Listing" />
                  <div className="card-body">
                    <h5 className="card-title">{hotel.name}</h5>
                    <p className="card-text">{hotel.address}</p>
                    <p className="card-text price">Price: ${hotel.price_per_night}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold rating">⭐ {hotel.rating || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}