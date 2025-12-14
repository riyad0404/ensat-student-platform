import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import axios from "axios";


export default function ResetPasswordToken() {
  const navigate = useNavigate();
  const { token } = useParams(); // récupère le token depuis l'URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!password || password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/reset-password-token", {
        token,          // envoie le token dans le body
        newPassword: password
      });
      setSuccess("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Token invalide ou expiré");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-right">
          <h2>Reset Password</h2>
          {error && <span className="error-text">⚠️ {error}</span>}
          {success && <span className="success-text">✅ {success}</span>}

          <Input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

          <Button text="Reset Password" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

