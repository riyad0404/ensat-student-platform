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

  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Validation en temps réel pour login
  const validateLoginField = (name, value) => {
  let error = "";
  
  switch (name) {
    case "email":
      if (!value) {
        error = "Email required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Invalid email format";
      }
      break;
      
    case "password":
      if (!value) return "Password required";
      if (value.length < 6) return "Minimum 6 characters";
      return "";
      
  }
  
  return error;
};

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validation en temps réel
    const error = validateLoginField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    // Effacer l'erreur générale si on corrige
    if (error === "" && formError) {
      setFormError("");
    }
  };

  const validateAllFields = () => {
    const newErrors = {
      email: validateLoginField("email", formData.email),
      password: validateLoginField("password", formData.password)
    };
    
    setErrors(newErrors);
    
    // Vérifier s'il y a des erreurs
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Valider tous les champs
    if (!validateAllFields()) {
      setFormError("Please correct the errors above.");
      return;
    }

    // Vérifier si tous les champs sont remplis
    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields");
      return;
    }

    setLoading(true);

  try {
    const result = await login(formData);

    if (!result.success) {
      // Generic message for login failure
      setFormError("Incorrect login credentials. Please check your email and password.");
      
      // Optional: clear password for security
      setFormData(prev => ({ ...prev, password: "" }));
    }
    // ✅ IF SUCCESS → automatic redirect via AuthContext
  } catch (err) {
    console.error(err);
    
    // Error type detection
    if (err.response?.status === 401) {
      setFormError("Incorrect login credentials.");
    } else if (err.response?.status === 404) {
      setFormError("No account found with this email.");
    } else if (err.response?.status >= 500) {
      setFormError("Login service unavailable. Please try again later.");
    } else {
      setFormError("Connection error. Please check your network.");
    }
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

          {formError && (
            <div className="error-message">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="EMAIL"
              type="email"
              placeholder="ex: user@example.com"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              required
            />

            <Input
              label="PASSWORD"
              type="password"
              placeholder="Enter Your Password"
              icon={<FiLock />}
              value={formData.password}
              onChange={handleChange("password")}
              error={errors.password}
              required
            />

            <div className="forgot-wrapper">
  <span
    className="forgot"
    onClick={() => setShowForgotOptions(prev => !prev)}
  >
    Forgot Password?
  </span>

  {showForgotOptions && (
    <div className="forgot-dropdown">
      <div onClick={() => navigate("/resetByCode")}>
        Reset by Code Secret
      </div>
      <div onClick={() => navigate("/resetByEmail")}>
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
            className="btn-create secondary"
            onClick={() => navigate("/register")}
          />
        </div>
      </div>
    </div>
  );
}