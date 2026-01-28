
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./../styles/login.css";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import resetImg from "../assets/login-illustration.png";
import logoImg from "../assets/logo.jpeg";
import { validatePasswordField, applyPasswordPolicyBackendError } from "../utils/authValidation";

export default function ResetPasswordToken() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  // États pour les champs
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  
  // États pour les erreurs de validation
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vérifiez le token au chargement
  useEffect(() => {
    if (!token) {
      setError("Invalid link - missing token");
      setTokenValid(false);
    }
  }, [token]);

  // Fonction de validation des champs
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "password":
        return validatePasswordField(value);
        
      case "confirmPassword":
        if (!value) return "Confirmation required";
        return "";
        
      default:
        return "";
    }
  };

  // Gestion du changement de valeur
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validation en temps réel
    const errorMsg = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
    
    // Effacer l'erreur générale si on corrige
    if (errorMsg === "" && error) {
      setError("");
    }
    
    // Vérifier la correspondance des mots de passe en temps réel
    if (field === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: "The passwords do not match"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ""
        }));
      }
    }
    
    if (field === "confirmPassword" && formData.password) {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: "The passwords do not match"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ""
        }));
      }
    }
  };

  // Validation complète avant soumission
  const validateAllFields = () => {
    const newErrors = {
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword)
    };
    
    // Vérifier la correspondance des mots de passe
    if (formData.password && formData.confirmPassword && 
        formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "The passwords do not match";
    }
    
    setErrors(newErrors);
    
    // Vérifier s'il y a des erreurs
    return !Object.values(newErrors).some(err => err !== "");
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      setError("Invalid link");
      return;
    }
    
    setError("");
    setSuccess("");
    
    // Valider tous les champs
    if (!validateAllFields()) {
      setError("Please correct the errors above");
      return;
    }
    
    // Vérifier si tous les champs sont remplis
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    // Vérifier la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: "The passwords do not match" 
      }));
      setError("The passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password-token", {
        token,
        newPassword: formData.password
      });
      
      console.log("✅ Réponse reset:", response.data);
      setSuccess("Password successfully reset!");
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur reset:", err);
      const serverMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Invalid or expired token";
      
      // Messages d'erreur personnalisés
      if (serverMessage.toLowerCase().includes("expired") || 
          serverMessage.toLowerCase().includes("expired")) {
        setError("This reset link has expired. Please request a new one.");
      } else if (serverMessage.toLowerCase().includes("invalid") || 
                 serverMessage.toLowerCase().includes("invalid")) {
        setError("Invalid reset link. Please check the URL.");
      } else if (err.response?.status === 404) {
        setError("User not found. The account may have been deleted.");
      } else if (err.response?.status === 400) {
        const backendData = err.response?.data;

        const applied = applyPasswordPolicyBackendError({
          backendData,
          setError,
          setFieldErrors: setErrors,
          passwordFieldName: "password",
        });

        if (!applied) {
          setError("Invalid password. Please use a stronger password.");
        }
      } else {
        setError(serverMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si pas de token, affichez un message
  if (!tokenValid) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-right">
            <h2>Invalid Link</h2>
            <div className="error-message">
              This reset link is invalid or has expired.
            </div>
            <Button 
              text="Back to Login" 
              className="btn-create"
              onClick={() => navigate("/login")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img 
            src={resetImg} 
            alt="Reset Password" 
            className="login-illustration" 
          />
        </div>

        <div className="login-right">
          <img src={logoImg} alt="Logo" className="top-right-logo" />
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your new password</p>
          
          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Champ mot de passe avec visibilité */}
            <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input 
                label="NEW PASSWORD" 
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password " 
                value={formData.password} 
                onChange={handleChange("password")}
                error={errors.password}
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
            
            {/* Champ confirmation avec visibilité */}
            <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input 
                label="CONFIRM PASSWORD" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm  new password" 
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
