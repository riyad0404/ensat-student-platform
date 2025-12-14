import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import resetImg from "../assets/login-illustration.png";
import Input from "../components/input";
import Button from "../components/button";
import axios from "axios";

export default function ResetPasswordByCode() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !secretCode || !newPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/reset-password-secret",
        { email, secretCode, newPassword }
      );
      navigate("/login");
    } catch (_err) {
      setError("Code secret invalide ou expiré");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* IMAGE */}
        <div className="login-left">
          <img src={resetImg} className="login-illustration" />
        </div>

        {/* FORM */}
        <div className="login-right">
          <h2>Reset Password</h2>
          <p className="subtitle">
            Enter your secret code to reset your password
          </p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleReset}>
            <Input label="EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="CODE SECRET" value={secretCode} onChange={e => setSecretCode(e.target.value)} />
            <Input label="NEW PASSWORD" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input label="CONFIRM PASSWORD" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

            <Button text="RESET PASSWORD" type="submit" className="btn-create" />
          </form>

          <p className="redirect">
            Back to <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>

      </div>
    </div>
  );
}

