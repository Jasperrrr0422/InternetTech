import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import House from "../assets/HouseLogo/Houselogo.jsx"

export default function LoginPage() {
  const [role, setRole] = useState("User");
  const navigate = useNavigate();

  return (
    <div className="login-page-container">
    
      <nav className="header-nav">
        <h4 className="welcome-text">Welcome</h4>
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>Home</button>
      </nav>

      <div className="d-flex align-items-center justify-content-center login-content">
     
       <House/>

        
        <div className="card p-5 shadow-lg login-card">
          <h2 className="text-center mb-4">Sign in</h2>

          <div className="btn-group w-100 mb-4">
            {["User", "Owners", "Admins"].map((r) => (
              <button
                key={r}
                className={`btn ${role === r ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="form-label">Username</label>
            <input type="text" className="form-control form-control-lg" placeholder="Enter username" />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control form-control-lg" placeholder="Enter password" />
          </div>

          <div className="text-end mb-4">
            <a href="/register" className="text-primary">Create an account</a>
          </div>

          <button className="btn btn-primary w-100 btn-lg">Login</button>
        </div>
      </div>
    </div>
  );
}