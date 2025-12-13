import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext"; // ⭐ IMPORT
import { useState } from "react"; // ⭐ IMPORT
import { useNavigate } from "react-router-dom"; // ⭐ IMPORT

export default function Register() {
  const { register } = useAuth(); // ⭐ UTILISE TON CONTEXTE
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    level: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation simple
    if (!formData.name || !formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData); // ⭐ UTILISE TA FONCTION
      
      if (result.success) {
        // Redirection automatique gérée par AuthContext
        console.log("✅ Inscription réussie!");
      } else {
        setError(result.error || "Erreur d'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
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
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {/* Message d'erreur */}
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
              label="FULL NAME" 
              placeholder="Enter Your Full Name"
              value={formData.name}
              onChange={handleChange("name")}
            />
            
            <Input 
              label="EMAIL" 
              placeholder="Enter Your Email" 
              icon={<FiMail />} 
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
            />
            
            <Input 
              label="LEVEL" 
              placeholder="Enter Your Level"
              value={formData.level}
              onChange={handleChange("level")}
            />
            
            <Input 
              label="PASSWORD" 
              placeholder="Enter Your Password" 
              icon={<FiLock />} 
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
            />

            <Button 
              text={loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"} 
              className="btn-create" 
              type="submit"
              disabled={loading}
            />
          </form>

          <p className="redirect">
            Already have an account?{" "}
            <a 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{ cursor: "pointer", color: "#007bff" }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}