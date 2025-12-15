// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
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
  
  // ⭐ AJOUTÉ : État pour les erreurs de chaque champ
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
    
    // Validation en temps réel
    const errorMsg = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");

  const { nom, prenom, email, niveau, password, secretCode } = formData;

  // Validation complète
  const newErrors = {
    nom: validateField("nom", nom),
    prenom: validateField("prenom", prenom),
    email: validateField("email", email),
    niveau: validateField("niveau", niveau),
    password: validateField("password", password),
    secretCode: validateField("secretCode", secretCode)
  };

  setFieldErrors(newErrors);

  // Vérifier s'il y a des erreurs
  const hasErrors = Object.values(newErrors).some(err => err !== "");
  if (hasErrors) {
    setError("Please check the information you entered.");
    return;
  }

  // ✅ Vérification côté frontend
  if (!nom || !prenom || !email || !niveau || !password || !secretCode) {
    setError("All fields are required.");
    return;
  }

  // Convertir secretCode en nombre
  const secretCodeNum = parseInt(secretCode);
  if (isNaN(secretCodeNum)) {
    setFieldErrors(prev => ({ ...prev, secretCode: "The secret code must be a number." }));
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
      setSuccessMessage("Account created successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      // Professional error messages
      if (result.error?.toLowerCase().includes("email") || 
          result.error?.toLowerCase().includes("already") ||
          result.error?.toLowerCase().includes("exists")) {
        setError("This email is already registered. Please use a different email.");
      } else if (result.error?.toLowerCase().includes("code") || 
                 result.error?.toLowerCase().includes("secret")) {
        setError("Incorrect secret code. Please check your code.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  } catch (err) {
    console.error(err);
    // Error type detection
    if (err.response?.status === 409) {
      setError("This email is already registered.");
    } else if (err.response?.status === 400) {
      setError("Invalid registration data.");
    } else {
      setError("Registration service unavailable. Please try again later.");
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
              placeholder="Enter Your Last Name"
              value={formData.nom}
              onChange={handleChange("nom")}
              error={fieldErrors.nom}
              required
            />
            <Input
              label="First Name"
              placeholder="Enter Your First Name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              error={fieldErrors.prenom}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter Your Email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Level"
              placeholder="Enter Your Level"
              value={formData.niveau}
              onChange={handleChange("niveau")}
              error={fieldErrors.niveau}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter Your Password"
              icon={<FiLock />}
              value={formData.password}
              onChange={handleChange("password")}
              error={fieldErrors.password}
              required
            />
            <Input
              label="Secret Code"
              type="number"
              placeholder="Enter 6-digit secret code"
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