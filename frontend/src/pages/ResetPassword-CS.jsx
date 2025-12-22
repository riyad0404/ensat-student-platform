// src/pages/ResetPasswordByCode.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import resetImg from "../assets/login-illustration.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Input from "../components/input";
import Button from "../components/button";
import axios from "axios";

const RESET_SECRET_LOCK_KEY = "reset_secret_lock_until_ms";
const LOCK_DURATION_SECONDS = 5 * 60; // ✅ 5 minutes fixes

const formatMMSS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function ResetPasswordByCode() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    secretCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    secretCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔐 lock timestamp
  const [lockUntilMs, setLockUntilMs] = useState(() => {
    const raw = localStorage.getItem(RESET_SECRET_LOCK_KEY);
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

  // ▶️ Au montage : reprendre le compteur s’il existe
  useEffect(() => {
    if (isLocked) {
      setError(
        `Too many reset attempts. Please try again in ${formatMMSS(
          remainingSeconds
        )}.`
      );
    } else {
      localStorage.removeItem(RESET_SECRET_LOCK_KEY);
    }
  }, []);

  // ⏱️ Compteur 5:00 → 0
  useEffect(() => {
    if (!isLocked) return;

    const id = setInterval(() => {
      const raw = localStorage.getItem(RESET_SECRET_LOCK_KEY);
      const until = raw ? Number(raw) : 0;

      if (!Number.isFinite(until) || until <= Date.now()) {
        localStorage.removeItem(RESET_SECRET_LOCK_KEY);
        setLockUntilMs(0);
        setError("");
        return;
      }

      const secs = Math.ceil((until - Date.now()) / 1000);
      setError(
        `Too many reset attempts. Please try again in ${formatMMSS(secs)}.`
      );
    }, 1000);

    return () => clearInterval(id);
  }, [isLocked]);

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "secretCode":
        if (!value) return "Secret code required";
        if (!/^\d{6}$/.test(value)) return "6 digits required";
        return "";
      case "newPassword":
        if (!value) return "Password required";
        if (value.length < 6) return "Minimum 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Confirmation required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    if (isLocked) return;

    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));

    if (!err && error) setError("");
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(
        `Too many reset attempts. Please try again in ${formatMMSS(
          remainingSeconds
        )}.`
      );
      return;
    }

    setError("");
    setSuccess("");

    const newErrors = {
      email: validateField("email", formData.email),
      secretCode: validateField("secretCode", formData.secretCode),
      newPassword: validateField("newPassword", formData.newPassword),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== "")) {
      setError("Please correct the errors");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "The passwords do not match",
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
          newPassword: formData.newPassword,
        }
      );

      setSuccess("✅ Password successfully reset !");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const status = err?.response?.status;

      // 🔐 429 → démarrer compteur 5:00
      if (status === 429) {
        const until = Date.now() + LOCK_DURATION_SECONDS * 1000;
        localStorage.setItem(RESET_SECRET_LOCK_KEY, String(until));
        setLockUntilMs(until);
        setError(
          `Too many reset attempts. Please try again in ${formatMMSS(
            LOCK_DURATION_SECONDS
          )}.`
        );
        return;
      }

      if (status === 400) {
        setError("❌ Invalid secret code or email.");
        return;
      }

      setError("Reset service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card reset-page">
        <div className="login-left">
          <img src={resetImg} alt="Reset Password" className="login-illustration" />
        </div>

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
              value={formData.email}
              onChange={handleChange("email")}
              error={errors.email}
              required
              disabled={loading || isLocked}
            />

            <Input
              label="CODE SECRET"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              error={errors.secretCode}
              required
              disabled={loading || isLocked}
            />

            <Input
              label="NEW PASSWORD"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange("newPassword")}
              error={errors.newPassword}
              required
              disabled={loading || isLocked}
            />

            <Input
              label="CONFIRM PASSWORD"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={errors.confirmPassword}
              required
              disabled={loading || isLocked}
            />

            <Button
              text={
                isLocked
                  ? "TRY AGAIN IN 5 MINUTES"
                  : loading
                  ? "RESETTING..."
                  : "RESET PASSWORD"
              }
              type="submit"
              className="btn-create"
              disabled={loading || isLocked}
            />
          </form>

          <p className="redirect">
            Back to{" "}
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
