import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import loginImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";

export default function LoginPage() {
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

    console.log('=== DEBUG LOGIN ===');
    console.log('1. Données du formulaire:', formData);
    
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      console.log('2. Appel à login()...');
      const result = await login(formData);
      
      console.log('3. Résultat du login:', result);
      
      if (result.success) {
        console.log('✅ Login réussi!');
        // La redirection est gérée dans AuthContext.jsx
      } else {
        console.error('❌ Erreur login:', result.error);
        setError(result.error || "Erreur de connexion");
      }
    } catch (err) {
      console.error('❌ Exception login:', err);
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
      console.log('=== FIN DEBUG ===');
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
              marginBottom: "15px",
              fontSize: "14px"
            }}>
              ⚠️ {error}
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
              required
              autoComplete="email"
            />
            
            <Input 
              label="PASSWORD" 
              placeholder="Enter Your Password" 
              icon={<FiLock />} 
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              required
              autoComplete="current-password"
            />

            <a className="forgot">Forgot Password?</a>

            <Button 
              text={loading ? "LOGGING IN..." : "LOGIN"} 
              className="btn-login" 
              type="submit"
              disabled={loading}
            />
          </form>
          
          {/* ⚠️ BOUTON "CREATE AN ACCOUNT" */}
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