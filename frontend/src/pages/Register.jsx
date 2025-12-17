// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau: "",
    password: "",
    secretCode: ""
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau: "",
    password: "",
    secretCode: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email format";
        }
        return "";
        
      case "password":
        if (!value) return "Password required";
        if (value.length < 6) return "Minimum 6 characters";
        return "";
        
      case "secretCode":
        if (!value) return "Secret code required";
        if (!/^\d{6}$/.test(value)) return "6 digits required";
        return "";
        
      case "nom":
      case "prenom":
        if (!value) return "Field required";
        if (value.length < 2) return "Minimum 2 characters";
        return "";
        
      case "niveau":
        if (!value) return "Level required";
        return "";
        
      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    const errorMsg = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
    
    // Reset general error when user modifies a field
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const { nom, prenom, email, niveau, password, secretCode } = formData;

    // Complete validation
    const newErrors = {
      nom: validateField("nom", nom),
      prenom: validateField("prenom", prenom),
      email: validateField("email", email),
      niveau: validateField("niveau", niveau),
      password: validateField("password", password),
      secretCode: validateField("secretCode", secretCode)
    };

    setFieldErrors(newErrors);

    // Check for errors
    const hasErrors = Object.values(newErrors).some(err => err !== "");
    if (hasErrors) {
      setError("Please check the entered information.");
      return;
    }

    // Convert secretCode to number
    const secretCodeNum = parseInt(secretCode);
    if (isNaN(secretCodeNum)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        secretCode: "Secret code must be a number." 
      }));
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        nom,
        prenom,
        email,
        niveau,
        password,
        secretCode: secretCodeNum
      });

      if (result.success) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Custom error message - Email already exists
        setError("This email is already registered. Please use another email or login.");
        setFieldErrors(prev => ({
          ...prev,
          email: "Email already in use"
        }));
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      // HTTP error handling with custom messages
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || "";
      
      console.log("Status:", status);
      console.log("Server message:", serverMessage);
      
      // Analyze error message to detect type
      const errorLower = serverMessage.toLowerCase();
      
      if (
        status === 409 || 
        errorLower.includes("email") ||
        errorLower.includes("already") ||
        errorLower.includes("exists") ||
        errorLower.includes("duplicate")
      ) {
        // Email already exists
        setError("This email is already registered. Please use another email or login.");
        setFieldErrors(prev => ({
          ...prev,
          email: "Email already in use"
        }));
      } 
      else if (
        status === 400 &&
        (errorLower.includes("code") || errorLower.includes("secret"))
      ) {
        // Invalid secret code
        setError("Invalid secret code. Please contact the administrator for the correct code.");
        setFieldErrors(prev => ({
          ...prev,
          secretCode: "Invalid code"
        }));
      }
      else if (status === 400) {
        // Invalid data
        setError("The entered information is invalid. Please check all fields.");
      }
      else if (status === 500) {
        // Server error
        setError("Server error. Please try again in a few moments.");
      } 
      else if (err.message === "Network Error" || !navigator.onLine) {
        // Connection problem
        setError("Internet connection problem. Please check your connection.");
      }
      else {
        // Generic error
        setError("An error occurred during registration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img
            src={registerImg}
            alt="Register Illustration"
            className="login-illustration"
          />
        </div>

        <div className="login-right register-page">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {error && <div className="error-text">⚠️ {error}</div>}
          {successMessage && <div className="success-text">✅ {successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.nom}
              onChange={handleChange("nom")}
              error={fieldErrors.nom}
              required
            />
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              error={fieldErrors.prenom}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Level"
              placeholder="Enter your level"
              value={formData.niveau}
              onChange={handleChange("niveau")}
              error={fieldErrors.niveau}
              required
            />
           <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange("password")}
                error={fieldErrors.password}
                required
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute',
                  right: '1rem',
                  top: '2.3rem',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 10,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4a90e2'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <Input
              label="Secret Code"
              type="number"
              placeholder="Enter the 6-digit code"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              error={fieldErrors.secretCode}
              required
              min="100000"
              max="999999"
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
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }} 
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}