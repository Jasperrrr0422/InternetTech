import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";


export default function LoginPage() {
  const [role, setRole] = useState("User");

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-gradient p-5"
      style={{ background: "linear-gradient(to right, #f3e7e9, #e3eeff)" }}>
      
      {/* 民宿风格的房子 */}
      <div className="house-container">
        <div className="house">
          <div className="roof"></div>
          <div className="chimney"></div>
          <div className="walls"></div>
          <div className="door"></div>
          <div className="window window1"></div>
          <div className="window window2"></div>
          <div className="fence"></div>
          <div className="grass"></div>
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
        </div>
      </div>

      <div className="card p-5 shadow-lg" style={{ width: "750px", padding: "40px", background: "#fffaf0", borderRadius: "12px" }}>
        <h2 className="text-center mb-4" style={{ fontSize: "2rem", color: "#4a4a4a" }}>Sign in</h2>

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
          <label className="form-label" style={{ fontSize: "1.2rem", color: "#4a4a4a" }}>Username</label>
          <input type="text" className="form-control form-control-lg" placeholder="Enter username" />
        </div>

        <div className="mb-4">
          <label className="form-label" style={{ fontSize: "1.2rem", color: "#4a4a4a" }}>Password</label>
          <input type="password" className="form-control form-control-lg" placeholder="Enter password" />
        </div>

        <div className="text-end mb-4">
          <a href="/register" className="text-primary" style={{ fontSize: "1rem" }}>Create an account</a>
        </div>

        <button className="btn btn-primary w-100 btn-lg">Login</button>
      </div>
    </div>
  );
}