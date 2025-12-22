// src/pages/ForgotPasswordEmail.jsx (ou ResetPassword-email.jsx selon votre nom)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail } from "react-icons/fi";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import axios from "axios";
import registerImg from "../assets/login-illustration.png";

const RESET_EMAIL_LOCK_KEY = "reset_email_lock_until_ms";
const LOCK_DURATION_SECONDS = 5 * 60; // ✅ 5 minutes fixes

const formatMMSS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function ForgotPasswordEmail() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔐 Lock state persisté
  const [lockUntilMs, setLockUntilMs] = useState(() => {
    const raw = localStorage.getItem(RESET_EMAIL_LOCK_KEY);
    const v = raw ? Number(raw) : 0;
    return Number.isFinite(v) ? v : 0;
  });

  const isLocked = useMemo(() => {
    return lockUntilMs && Date.now() < lockUntilMs;
  }, [lockUntilMs]);

  const remainingSeconds = useMemo(() => {
    if (!isLocked) return 0;
    return Math.ceil((lockUntilMs - Date.now()) / 1000);
  }, [isLocked, lockUntilMs]);

  const validateEmail = (value) => {
    if (!value) return "Email required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return "";
  };

  // ▶️ Au montage : si lock actif, afficher le compteur directement
  useEffect(() => {
    const raw = localStorage.getItem(RESET_EMAIL_LOCK_KEY);
    const until = raw ? Number(raw) : 0;

    if (Number.isFinite(until) && until > Date.now()) {
      setLockUntilMs(until);
      const secs = Math.ceil((until - Date.now()) / 1000);
      setError(`Too many password reset requests. Please try again in ${formatMMSS(secs)}.`);
    } else {
      localStorage.removeItem(RESET_EMAIL_LOCK_KEY);
      setLockUntilMs(0);
    }
  }, []);

  // ⏱️ Décompte 05:00 → 00:00
  useEffect(() => {
    if (!isLocked) return;

    const id = setInterval(() => {
      const raw = localStorage.getItem(RESET_EMAIL_LOCK_KEY);
      const until = raw ? Number(raw) : 0;

      if (!Number.isFinite(until) || until <= Date.now()) {
        localStorage.removeItem(RESET_EMAIL_LOCK_KEY);
        setLockUntilMs(0);
        setError("");
        return;
      }

      const secs = Math.ceil((until - Date.now()) / 1000);
      setError(`Too many password reset requests. Please try again in ${formatMMSS(secs)}.`);
    }, 1000);

    return () => clearInterval(id);
  }, [isLocked]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // 🔒 Si lock actif : ne pas envoyer la requête
    if (isLocked) {
      setMessage("");
      setError(`Too many password reset requests. Please try again in ${formatMMSS(remainingSeconds)}.`);
      return;
    }

    setError("");
    setEmailError("");
    setMessage("");

    // Validation email
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });

      // ✅ message neutre (votre backend renvoie déjà un message neutre aussi)
      setMessage("✅ Check your email! You will receive a link to reset your password.");
    } catch (err) {
      const status = err?.response?.status;

      // ✅ 429 -> lock 5 minutes + compteur
      if (status === 429) {
        const until = Date.now() + LOCK_DURATION_SECONDS * 1000;
        localStorage.setItem(RESET_EMAIL_LOCK_KEY, String(until));
        setLockUntilMs(until);

        setError(
          `Too many password reset requests. Please try again in ${formatMMSS(
            LOCK_DURATION_SECONDS
          )}.`
        );
        return;
      }

      setError("❌ Invalid email address or server problem");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card reset-page">
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
                if (isLocked) return; // ✅ bloque la saisie pendant lock
                const v = e.target.value;
                setEmail(v);
                setEmailError(validateEmail(v));
                if (error) setError("");
              }}
              error={emailError}
              required
              disabled={loading || isLocked}
            />

            <Button
              text={
                isLocked
                  ? "TRY AGAIN IN 5 MINUTES"
                  : loading
                  ? "SENDING..."
                  : "SEND RESET LINK"
              }
              className="btn-create"
              onClick={handleSubmit}
              disabled={loading || isLocked}
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
