// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import loginImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showForgotOptions, setShowForgotOptions] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);

      if (!result.success) {
        setError(result.error || "Email ou mot de passe incorrect");
      }
      // ✅ SI SUCCESS → redirection automatique via AuthContext
    } catch (err) {
      setError("Erreur serveur, veuillez réessayer plus tard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* IMAGE */}
        <div className="login-left">
          <img
            src={loginImg}
            alt="Login Illustration"
            className="login-illustration"
          />
        </div>

        {/* FORM */}
        <div className="login-right">
          <h2>Welcome Back!</h2>
          <p className="subtitle">Sign in to continue</p>

          {error && <span className="error-text">⚠️ {error}</span>}

          <form onSubmit={handleSubmit}>
            <Input
              label="EMAIL"
              type="email"
              placeholder="Enter Your Email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              required
            />

            <Input
              label="PASSWORD"
              type="password"
              placeholder="Enter Your Password"
              icon={<FiLock />}
              value={formData.password}
              onChange={handleChange("password")}
              required
            />

            <div className="forgot-wrapper" style={{ position: "relative" }}>
  <span
    className="forgot"
    onClick={() => setShowForgotOptions(prev => !prev)}
    style={{ cursor: "pointer" }}
  >
    Forgot Password?
  </span>

  {showForgotOptions && (
    <div
      className="forgot-dropdown"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "5px 0",
        width: "200px",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}
    >
      <div
        style={{ padding: "8px 15px", cursor: "pointer" }}
        onClick={() => navigate("/resetByCode")}
      >
        Reset by Code Secret
      </div>
      <div
        style={{ padding: "8px 15px", cursor: "pointer" }}
        onClick={() => navigate("/resetByEmail")}
      >
        Reset by Email Link
      </div>
    </div>
  )}
</div>


            <Button
              text={loading ? "LOGGING IN..." : "LOGIN"}
              className="btn-login"
              type="submit"
              disabled={loading}
            />
          </form>

          <Button
            text="CREATE AN ACCOUNT"
            className="btn-create"
            onClick={() => navigate("/register")}
          />
        </div>
      </div>
    </div>
  );
}

