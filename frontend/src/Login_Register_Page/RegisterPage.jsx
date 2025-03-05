import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import House from "../assets/HouseLogo/Houselogo.jsx"
import {register} from "../api.js"

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);
    try {
      await register(username, email, password, firstName, lastName, role);
      setSuccess(true);
      // setTimeout(() => navigate("/login"), 2000); 
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-gradient p-5"
      style={{ background: "linear-gradient(to right, #f3e7e9, #e3eeff)" }}>
      <nav className="header-nav">
        <button className="btn btn-outline-primary" onClick={() => navigate("/")}>Home</button>
      </nav>

      <House />
      
      <div className="card login-card p-5 shadow-lg">
        <h2 className="text-center mb-4 login-title">Sign up</h2>

        <div className="btn-group w-100 mb-4">
          {["user", "owner"].map((r) => (
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
          <label className="form-label">First Name</label>
          <input 
            type="text" 
            className="form-control form-control-lg" 
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Last Name</label>
          <input 
            type="text" 
            className="form-control form-control-lg" 
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control form-control-lg" 
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        {success && <div className="text-success text-center mb-3">Registration successful!</div>}

        <div className="text-end mb-4">
          <a href="/login" className="text-primary">Go to login..</a>
        </div>

        <button className="btn btn-primary w-100 btn-lg" onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}