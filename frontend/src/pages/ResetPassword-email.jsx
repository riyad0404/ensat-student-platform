import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail } from "react-icons/fi";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import axios from "axios";
import registerImg from "../assets/appname.jpeg";

export default function ForgotPasswordEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(""); // ⭐ Erreur spécifique
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validateEmail = (email) => {
    if (!email) return "Email required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    return "";
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setEmailError("");
    setMessage("");

    // Validation
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("✅ Check your email! You will receive a link to reset your password.");
    } catch (err) {
      setError("❌ Invalid email address or server problem");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card reset-page"> {/* ⭐ AJOUTEZ reset-page */}
        <div className="login-left">
          <img src={registerImg} alt="Reset Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your email to reset your password</p>

          {error && <div className="error-message">⚠️ {error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="EMAIL"
              placeholder="Enter Your Email"
              icon={<FiMail />}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
              error={emailError}
              required
            />

            <Button
              text={loading ? "SENDING..." : "SEND RESET LINK"}
              className="btn-create"
              onClick={handleSubmit}
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