import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import House from "../assets/HouseLogo/Houselogo.jsx"

export default function LoginPage() {
  const [role, setRole] = useState("User");
  const navigate = useNavigate();
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-gradient p-5"
      style={{ background: "linear-gradient(to right, #f3e7e9, #e3eeff)" }}>
      <nav className="header-nav">
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>Home</button>
      </nav>

      <House/>
      
      <div className="card login-card p-5 shadow-lg">
        <h2 className="text-center mb-4 login-title">Sign in</h2>

        <div className="btn-group w-100 mb-4">
          {["User", "Owners"].map((r) => (
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
          <label className="form-label" >Username</label>
          <input type="text" className="form-control form-control-lg" placeholder="Enter username" />
        </div>

        <div className="mb-4">
          <label className="form-label" >Firstname</label>
          <input type="text" className="form-control form-control-lg" placeholder="Enter firstname" />
        </div>
        <div className="mb-4">
          <label className="form-label" >Lastname</label>
          <input type="text" className="form-control form-control-lg" placeholder="Enter lastname" />
        </div>

        <div className="mb-4">
          <label className="form-label" >Email</label>
          <input type="email" className="form-control form-control-lg" placeholder="Enter email" />
        </div>

        <div className="mb-4">
          <label className="form-label" >Password</label>
          <input type="password" className="form-control form-control-lg" placeholder="Enter password" />
        </div>

        <div className="text-end mb-4">
          <a href="/login" className="text-primary" >Go to login..</a>
        </div>

        <button className="btn btn-primary w-100 btn-lg">Register</button>
      </div>
    </div>
  );
}