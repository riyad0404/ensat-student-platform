// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const SIGNUP_LOCK_UNTIL_KEY = "signup_lock_until_ms";

const formatMMSS = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau: "",
    password: "",
    secretCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau: "",
    password: "",
    secretCode: "",
  });

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ persisted lock
  const [lockUntilMs, setLockUntilMs] = useState(() => {
    const v = localStorage.getItem(SIGNUP_LOCK_UNTIL_KEY);
    const n = v ? Number(v) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  const now = Date.now();
  const isLocked = lockUntilMs > now;
  const remainingSeconds = isLocked ? Math.ceil((lockUntilMs - now) / 1000) : 0;

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  // ✅ countdown
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      const stored = Number(localStorage.getItem(SIGNUP_LOCK_UNTIL_KEY) || 0);
      if (!stored || stored <= Date.now()) {
        localStorage.removeItem(SIGNUP_LOCK_UNTIL_KEY);
        setLockUntilMs(0);
        setFormError("");
      } else {
        setLockUntilMs(stored);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  // ✅ on mount, show correct message if locked
  useEffect(() => {
    if (isLocked) {
      setFormError(
        `Too many signup attempts. Please try again in ${formatMMSS(remainingSeconds)}.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";

      case "password":
        if (!value) return "Password required";
        if (value.length < 6) return "Minimum 6 characters";
        return "";

      case "secretCode":
        if (!value) return "Secret code required";
        if (!/^\d{6}$/.test(value)) return "6 digits required";
        return "";

      case "nom":
      case "prenom":
        if (!value) return "Field required";
        if (value.length < 2) return "Minimum 2 characters";
        return "";

      case "niveau":
        if (!value) return "Level required";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    if (isLocked) return;

    const value = e.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));

    const errorMsg = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));

    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setFormError(
        `Too many signup attempts. Please try again in ${formatMMSS(remainingSeconds)}.`
      );
      return;
    }

    setFormError("");
    setSuccessMessage("");

    const { nom, prenom, email, niveau, password, secretCode } = formData;

    // full validation
    const newErrors = {
      nom: validateField("nom", nom),
      prenom: validateField("prenom", prenom),
      email: validateField("email", email),
      niveau: validateField("niveau", niveau),
      password: validateField("password", password),
      secretCode: validateField("secretCode", secretCode),
    };

    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((x) => x !== "");
    if (hasErrors) {
      setFormError("Please check the entered information.");
      return;
    }

    const secretCodeNum = parseInt(secretCode, 10);
    if (Number.isNaN(secretCodeNum)) {
      setFieldErrors((prev) => ({ ...prev, secretCode: "Secret code must be a number." }));
      setFormError("Please check the entered information.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        nom,
        prenom,
        email,
        niveau,
        password,
        secretCode: secretCodeNum,
      });

      // ✅ SUCCESS
      if (result?.success) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // ✅ 429 LOCK HERE (THIS is the key)
      if (result?.status === 429) {
        const retryAfterSeconds = Number(result.retryAfterSeconds) || 120;
        const until = Date.now() + retryAfterSeconds * 1000;

        localStorage.setItem(SIGNUP_LOCK_UNTIL_KEY, String(until));
        setLockUntilMs(until);

        // clear email field error (avoid illogical "email in use")
        setFieldErrors((prev) => ({ ...prev, email: "" }));

        setFormError(
          `Too many signup attempts. Please try again in ${formatMMSS(retryAfterSeconds)}.`
        );
        return;
      }

      // ✅ other errors
      const msgLower = String(result?.error || "").toLowerCase();

      const isDuplicate =
        result?.status === 409 ||
        (msgLower.includes("email") &&
          (msgLower.includes("already") || msgLower.includes("exists") || msgLower.includes("duplicate")));

      if (isDuplicate) {
        setFormError("This email is already registered. Please use another email or login.");
        setFieldErrors((prev) => ({ ...prev, email: "Email already in use" }));
        return;
      }

      if (result?.status === 400 && (msgLower.includes("code") || msgLower.includes("secret"))) {
        setFormError("Invalid secret code. Please contact the administrator for the correct code.");
        setFieldErrors((prev) => ({ ...prev, secretCode: "Invalid code" }));
        return;
      }

      setFormError(result?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabledAll = loading || isLocked;

  const buttonText = isLocked
    ? `TRY AGAIN IN ${formatMMSS(remainingSeconds)}`
    : loading
      ? "CREATING ACCOUNT..."
      : "CREATE ACCOUNT";

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right register-page">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {/* ✅ same design as login (red) */}
          {formError && (
            <div className="error-message">
              {isLocked
                ? `Too many signup attempts. Please try again in ${formatMMSS(remainingSeconds)}.`
                : formError}
            </div>
          )}

          {successMessage && <div className="success-text">✅ {successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.nom}
              onChange={handleChange("nom")}
              error={fieldErrors.nom}
              required
              disabled={disabledAll}
            />

            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              error={fieldErrors.prenom}
              required
              disabled={disabledAll}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              error={fieldErrors.email}
              required
              disabled={disabledAll}
            />

            <Input
              label="Level"
              placeholder="Enter your level"
              value={formData.niveau}
              onChange={handleChange("niveau")}
              error={fieldErrors.niveau}
              required
              disabled={disabledAll}
            />

            <div style={{ position: "relative", marginBottom: "1.2rem" }}>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange("password")}
                error={fieldErrors.password}
                required
                disabled={disabledAll}
              />
              <span
                onClick={() => !disabledAll && setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "2.3rem",
                  cursor: disabledAll ? "not-allowed" : "pointer",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 10,
                  opacity: disabledAll ? 0.5 : 1,
                  pointerEvents: disabledAll ? "none" : "auto",
                }}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>

            <Input
              label="Secret Code"
              type="number"
              placeholder="Enter the 6-digit code"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              error={fieldErrors.secretCode}
              required
              min="100000"
              max="999999"
              disabled={disabledAll}
            />

            <Button
              text={buttonText}
              className="btn-create"
              type="submit"
              disabled={disabledAll}
            />
          </form>

          <p className="redirect">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
