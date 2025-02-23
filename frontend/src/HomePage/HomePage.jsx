import React, { useState } from "react";


export default function HomePage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Home</a>
          <form className="d-flex search-bar">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
          </form>
          <div className="position-relative">
            <a href="/login" className="me-3 text-dark">Sign in</a>
            <button 
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              ☰
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu dropdown-menu-end show" style={{ position: "absolute", right: 0 }}>
                <li><a className="dropdown-item" href="#">Message</a></li>
                <li><a className="dropdown-item" href="#">Order History</a></li>
                <li><a className="dropdown-item" href="#">Log out</a></li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="container mt-4">
        <div className="row mb-4 search-container">
          <div className="col">
            <div className="input-group">
              <span className="input-group-text">Where</span>
              <input type="text" className="form-control" placeholder="Search destination" />
            </div>
          </div>
          <div className="col">
            <input type="date" className="form-control" placeholder="Check in" />
          </div>
          <div className="col">
            <input type="date" className="form-control" placeholder="Check out" />
          </div>
          <div className="col">
            <input type="number" className="form-control" placeholder="Who" />
          </div>
          <div className="col">
            <button className="btn btn-primary w-100">Search</button>
          </div>
        </div>

        {/* Listings */}
        <div className="row row-cols-1 row-cols-md-3 g-4 listings-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div className="col" key={i}>
              <div className="card shadow-sm listing-card">
                <img src="https://via.placeholder.com/150" className="card-img-top" alt="Listing" />
                <div className="card-body">
                  <h5 className="card-title">City, Country</h5>
                  <p className="card-text">Address</p>
                  <p className="card-text price">Price: $100</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold rating">⭐ 4.5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
