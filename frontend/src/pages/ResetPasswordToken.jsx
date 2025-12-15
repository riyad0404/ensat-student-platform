import { useState, useEffect } from "react"; // ⭐ Ajoutez useEffect
import { useNavigate, useParams } from "react-router-dom";
import "./../styles/login.css";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import axios from "axios";
import resetImg from "../assets/login-illustration.png";

export default function ResetPasswordToken() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true); // ⭐ État pour vérifier token

  // ⭐ Vérifiez le token au chargement
  useEffect(() => {
    if (!token) {
      setError("Invalid link - missing token");
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      setError("Invalid link");
      return;
    }
    
    setError("");
    setSuccess("");
    
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("The passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password-token", {
        token,
        newPassword: password
      });
      
      console.log("✅ Réponse reset:", response.data);
      setSuccess("Password successfully reset!");
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur reset:", err);
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Si pas de token, affichez un message
  if (!tokenValid) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-right">
            <h2>Lien invalide</h2>
            <div className="error-message">
              Ce lien de réinitialisation est invalide ou a expiré.
            </div>
            <Button 
              text="Retour à la connexion" 
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
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your new password</p>
          
          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            <Input 
              label="NEW PASSWORD" 
              type="password" 
              placeholder="New Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            <Input 
              label="CONFIRM PASSWORD" 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required
            />

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