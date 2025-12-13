import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import loginImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {  // ⭐ CHANGEZ "login" en "Login" (majuscule)
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        console.log("✅ Connexion réussie!");
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img src={loginImg} alt="Login Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Welcome Back!</h2>
          <p className="subtitle">Sign in to continue</p>

          {error && (
            <div className="error-message" style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input 
              label="EMAIL" 
              placeholder="Enter Your Email" 
              icon={<FiMail />} 
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
            />
            
            <Input 
              label="PASSWORD" 
              placeholder="Enter Your Password" 
              icon={<FiLock />} 
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
            />

            <a className="forgot">Forgot Password?</a>

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