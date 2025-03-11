import { useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import House from "../assets/HouseLogo/Houselogo.jsx";
import { login } from "../api.js";

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await login(username, password);
      
      if (response.access) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("username", response.username);
        localStorage.setItem("role", response.role)
        if (response.role === "user") {
          navigate("/userpage");
        } else if (response.role === "owner") {
          navigate("/owenermainpage");
        } else if (response.role === "admin") {
          navigate("/");
        } else {
          navigate("/login"); 
        }
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      setError(error.message || "Login failed");
    }
  };

  return (
    <div className="login-page-container">
      <nav className="header-nav">
        <h4 className="welcome-text">Welcome</h4>
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>Home</button>
      </nav>

      <div className="d-flex align-items-center justify-content-center login-content">
        <House />

        <div className="card p-5 shadow-lg login-card">
          <h2 className="text-center mb-4">Sign in</h2>

          <div className="btn-group w-100 mb-4">
            {["user", "owner", "admin"].map((r) => (
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
            <input 
              type="text" 
              className="form-control form-control-lg" 
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control form-control-lg" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-danger text-center mb-3">{error}</div>}

          <div className="text-end mb-4">
            <a href="/register" className="text-primary">Create an account</a>
          </div>

          <button className="btn btn-primary w-100 btn-lg" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}