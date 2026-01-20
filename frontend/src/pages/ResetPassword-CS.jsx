
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import resetImg from "../assets/login-illustration.png";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Ajout des icônes
import Input from "../components/input";
import Button from "../components/button";
import axios from "axios";
import { validatePasswordField, applyPasswordPolicyBackendError } from "../utils/authValidation";

export default function ResetPasswordByCode() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    secretCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    secretCode: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
        
      case "secretCode":
        if (!value) return "Secret code required";
        if (!/^\d{6}$/.test(value)) return "6 digits required";
        return "";
        
      case "newPassword":
        return validatePasswordField(value);
        
      case "confirmPassword":
        if (!value) return "Confirmation required";
        return "";
        
      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel
    const errorMsg = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    
    if (errorMsg === "" && error) {
      setError("");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation complète
    const newErrors = {
      email: validateField("email", formData.email),
      secretCode: validateField("secretCode", formData.secretCode),
      newPassword: validateField("newPassword", formData.newPassword),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword)
    };

    setErrors(newErrors);

    // Vérifier erreurs
    if (Object.values(newErrors).some(err => err !== "")) {
      setError("Please correct the errors");
      return;
    }

    // Vérifier correspondance mots de passe
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: "The passwords do not match" 
      }));
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/reset-password-secret",
        { 
          email: formData.email, 
          secretCode: formData.secretCode, 
          newPassword: formData.newPassword 
        }
      );
      
      setSuccess("✅ Password successfully reset !");
      setTimeout(() => navigate("/login"), 2000);
      
    } catch (err) {
      const backendData = err.response?.data;

      const applied = applyPasswordPolicyBackendError({
        backendData,
        setError,
        setFieldErrors: setErrors,
        passwordFieldName: "newPassword",
      });

      if (!applied) {
        setError("❌ Invalid or expired Code secret");
      }

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card reset-page">
        
        {/* IMAGE */}
        <div className="login-left">
          <img src={resetImg} alt="Reset Password" className="login-illustration" />
        </div>

        {/* FORM */}
        <div className="login-right">
          <h2>Reset Password</h2>
          <p className="subtitle">
            Enter your secret code to reset your password
          </p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <form onSubmit={handleReset}>
            <Input 
              label="EMAIL" 
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              required
            />
            
            <Input 
              label="CODE SECRET" 
              placeholder="6-digit code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              error={errors.secretCode}
              required
            />
            
            <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input 
                label="NEW PASSWORD" 
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange("newPassword")}
                error={errors.newPassword}
                required
              />
              <span 
                onClick={() => setShowNewPassword(!showNewPassword)}
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
                {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input 
                label="CONFIRM PASSWORD" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
                required
              />
              <span 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>

            <Button 
              text={loading ? "RESETTING..." : "RESET PASSWORD"} 
              type="submit" 
              className="btn-create"
              disabled={loading}
            />
          </form>

          <p className="redirect">
            Back to{" "}
            <span 
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "#E334FE", fontWeight: "600" }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
