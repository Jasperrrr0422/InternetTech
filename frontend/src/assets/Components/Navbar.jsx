import { useState, useEffect } from "react";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Home</a>
        <form className="d-flex search-bar">
          <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
        </form>
        <div className="position-relative">
          {username ? (
            <>
              <span className="me-3 fw-bold">{username}</span>
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
                  <li>
                    <a className="dropdown-item" href="#" onClick={() => {
                      localStorage.clear(); 
                      window.location.href = "/"; 
                    }}>
                      Log out
                    </a>
                  </li>
                </ul>
              )}
            </>
          ) : (
            <a href="/login" className="me-3 text-dark">Sign in</a>
          )}
        </div>
      </div>
    </nav>
  );
}