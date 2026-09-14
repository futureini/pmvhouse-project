import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../app";
import "../styles/login.css";

/* ✅ IMPORT LOGO */
import logo from "../assets/logo.png";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/admin");
  }, []);

  const login = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/login", {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      navigate("/admin");

    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* ✅ LOGO */}
        <div className="logo-box">
          <img src={logo} alt="Logo" />
        </div>

        <h2 className="login-title">Admin Login</h2>

        <form onSubmit={login}>

          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}
