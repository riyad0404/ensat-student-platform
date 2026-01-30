// src/pages/LoginPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import appNameImg from "../assets/appname.jpeg";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";

const LOGIN_LOCK_KEY = "auth_login_lock_until";        // timestamp ms
const LOGIN_LOCK_ACTIVE_KEY = "auth_login_lock_active"; // "1" or "0"

const formatMMSS = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showForgotOptions, setShowForgotOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // ✅ Lock state persisted (ms timestamp)
  const [lockUntil, setLockUntil] = useState(() => {
    const raw = localStorage.getItem(LOGIN_LOCK_KEY);
    const v = raw ? Number(raw) : 0;
    return Number.isFinite(v) ? v : 0;
  });

  const now = Date.now();
  const isLocked = lockUntil && lockUntil > now;

  const remainingSeconds = useMemo(() => {
    if (!isLocked) return 0;
    return Math.ceil((lockUntil - Date.now()) / 1000);
  }, [isLocked, lockUntil]);

  // ✅ On mount: if still locked -> show red message immediately (persist like signup)
  useEffect(() => {
    const rawUntil = localStorage.getItem(LOGIN_LOCK_KEY);
    const until = rawUntil ? Number(rawUntil) : 0;

    const active = localStorage.getItem(LOGIN_LOCK_ACTIVE_KEY) === "1";

    if (active && Number.isFinite(until) && until > Date.now()) {
      setLockUntil(until);
      const secs = Math.ceil((until - Date.now()) / 1000);
      setFormError(`Too many login attempts. Please try again in ${formatMMSS(secs)}.`);
    } else {
      // cleanup if expired
      localStorage.removeItem(LOGIN_LOCK_KEY);
      localStorage.removeItem(LOGIN_LOCK_ACTIVE_KEY);
      setLockUntil(0);
      setFormError("");
    }
  }, []);

  // ✅ Tick: keep message visible + update it every second while locked
  useEffect(() => {
    if (!isLocked) return;

    const intervalId = setInterval(() => {
      const rawUntil = localStorage.getItem(LOGIN_LOCK_KEY);
      const until = rawUntil ? Number(rawUntil) : 0;

      if (!Number.isFinite(until) || until <= Date.now()) {
        // unlock
        localStorage.removeItem(LOGIN_LOCK_KEY);
        localStorage.removeItem(LOGIN_LOCK_ACTIVE_KEY);
        setLockUntil(0);
        setFormError("");
        return;
      }

      setLockUntil(until);
      const secs = Math.ceil((until - Date.now()) / 1000);
      setFormError(`Too many login attempts. Please try again in ${formatMMSS(secs)}.`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isLocked]);

  // Validation
  const validateLoginField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";

      case "password":
        if (!value) return "Password required";
        if (value.length < 8) return "Minimum 8 characters";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));

    const err = validateLoginField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));

    // ✅ Do not auto-clear the lock message when locked
    if (!isLocked && err === "" && formError) setFormError("");
  };

  const validateAllFields = () => {
    const newErrors = {
      email: validateLoginField("email", formData.email),
      password: validateLoginField("password", formData.password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ If locked, keep the message (do not send request)
    if (isLocked) {
      setFormError(`Too many login attempts. Please try again in ${formatMMSS(remainingSeconds)}.`);
      return;
    }

    setFormError("");

    if (!validateAllFields()) {
      setFormError("Please correct the errors above.");
      return;
    }

    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);

      if (!result.success) {
        // ✅ RATE LIMIT -> persist lock + persist message visibility
        if (result.errorCode === "RATE_LIMIT") {
          const seconds = Number.isFinite(result.retryAfterSeconds)
            ? Math.max(1, result.retryAfterSeconds)
            : 120; // fallback only if backend doesn't send headers

          const until = Date.now() + seconds * 1000;

          localStorage.setItem(LOGIN_LOCK_KEY, String(until));
          localStorage.setItem(LOGIN_LOCK_ACTIVE_KEY, "1");

          setLockUntil(until);
          setFormError(`Too many login attempts. Please try again in ${formatMMSS(seconds)}.`);

          // clear password
          setFormData((prev) => ({ ...prev, password: "" }));
          return;
        }

        // other errors
        if (result.status === 404) {
          setFormError("User not found.");
        } else if (result.status === 401) {
          setFormError("Email or password incorrect");
        } else {
          setFormError(
            result.error || "Email or password incorrect"
          );
        }

        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setFormError("Email or password incorrect");
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
          <img src={appNameImg} alt="Login Illustration" className="login-illustration" />
        </div>

        {/* FORM */}
        <div className="login-right">
          <h2>Welcome back!</h2>
          <p className="subtitle">Sign in to continue</p>

          {/* ✅ SAME LOGIN DESIGN: red banner stays visible while locked */}
          {formError && <div className="error-message">{formError}</div>}

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
              disabled={loading || isLocked}
            />

            <div style={{ position: "relative", marginBottom: "1.2rem" }}>
              <Input
                label="PASSWORD"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={handleChange("password")}
                error={errors.password}
                required
                disabled={loading || isLocked}
              />

              <span
                onClick={() => !isLocked && setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "2.3rem",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 10,
                  transition: "color 0.2s",
                  opacity: isLocked ? 0.5 : 1,
                }}
                onMouseEnter={(e) => !isLocked && (e.currentTarget.style.color = "#4a90e2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>

            <div className="forgot-wrapper">
              <span
                className="forgot"
                onClick={() => setShowForgotOptions((prev) => !prev)}
              >
                Forgot Password?
              </span>

              {showForgotOptions && (
                <div className="forgot-dropdown">
                  <div onClick={() => navigate("/resetByCode")}>Reset by Code Secret</div>
                  <div onClick={() => navigate("/resetByEmail")}>Reset by Email Link</div>
                </div>
              )}
            </div>

            <Button
              text={
                isLocked
                  ? "TRY AGAIN IN 2 MINUTES" // ✅ SEULE MODIFICATION: texte statique, sans compteur
                  : loading
                  ? "LOGGING IN..."
                  : "LOGIN"
              }
              className="btn-login"
              type="submit"
              disabled={loading || isLocked}
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
