import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail } from "react-icons/fi";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import axios from "axios";
import registerImg from "../assets/login-illustration.png";

export default function ForgotPasswordEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("Check your email! You will receive a link to reset your password.");
    } catch (err) {
      setError("Email invalide ou problème serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img src={registerImg} alt="Reset Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your email to reset your password</p>

          {error && <span className="error-text">⚠️ {error}</span>}
          {message && <span className="success-text">✅ {message}</span>}

          <Input
            label="EMAIL"
            placeholder="Enter Your Email"
            icon={<FiMail />}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Button
            text={loading ? "Sending..." : "Check your email"}
            className="btn-create"
            onClick={handleSubmit}
            disabled={loading}
          />

          <p className="redirect">
            Back to <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "#007bff" }}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
