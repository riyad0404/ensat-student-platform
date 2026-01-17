// src/pages/Register.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { validatePasswordField, applyPasswordPolicyBackendError } from "../utils/authValidation";

const SIGNUP_LOCK_KEY = "signup_lock_until_ms";

const formatMMSS = (totalSeconds) => {
  const s = Math.max(0, Number(totalSeconds) || 0);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Lock state (persistant)
  const [signupLockedUntilMs, setSignupLockedUntilMs] = useState(null);
  const [signupRemainingSec, setSignupRemainingSec] = useState(0);

  const isSignupLocked = useMemo(() => {
    return !!signupLockedUntilMs && Date.now() < signupLockedUntilMs;
  }, [signupLockedUntilMs]);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  // ✅ Charger lock depuis localStorage au montage
  useEffect(() => {
    const raw = localStorage.getItem(SIGNUP_LOCK_KEY);
    const until = raw ? Number(raw) : null;
    if (until && !Number.isNaN(until) && until > Date.now()) {
      setSignupLockedUntilMs(until);
      setSignupRemainingSec(Math.ceil((until - Date.now()) / 1000));
    } else {
      localStorage.removeItem(SIGNUP_LOCK_KEY);
      setSignupLockedUntilMs(null);
      setSignupRemainingSec(0);
    }
  }, []);

  // ✅ Décompte (continue même après refresh/retour page)
  useEffect(() => {
    if (!signupLockedUntilMs) return;

    const tick = () => {
      const diff = signupLockedUntilMs - Date.now();
      if (diff <= 0) {
        setSignupLockedUntilMs(null);
        setSignupRemainingSec(0);
        localStorage.removeItem(SIGNUP_LOCK_KEY);
        // Optionnel: effacer le message d’erreur quand c’est débloqué
        setError("");
        return;
      }
      setSignupRemainingSec(Math.ceil(diff / 1000));
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [signupLockedUntilMs]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        if (!value) return "Email required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";

      case "password":
        return validatePasswordField(value);

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
    // ✅ si lock actif, on ignore la saisie
    if (isSignupLocked) return;

    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    const errorMsg = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: errorMsg,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ si lock actif, on ne soumet pas
    if (isSignupLocked) return;

    setError("");
    setSuccessMessage("");

    const { nom, prenom, email, niveau, password, secretCode } = formData;

    const newErrors = {
      nom: validateField("nom", nom),
      prenom: validateField("prenom", prenom),
      email: validateField("email", email),
      niveau: validateField("niveau", niveau),
      password: validateField("password", password),
      secretCode: validateField("secretCode", secretCode),
    };

    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) {
      setError("Please check the entered information.");
      return;
    }

    const secretCodeNum = parseInt(secretCode, 10);
    if (Number.isNaN(secretCodeNum)) {
      setFieldErrors((prev) => ({ ...prev, secretCode: "Secret code must be a number." }));
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

      // ✅ 1) PRIORITÉ: cas 429 (RATE LIMIT) → lock + compteur + champs bloqués
      if (!result.success && result.errorCode === "RATE_LIMIT") {
        const seconds = Number(result.retryAfterSeconds);
        const untilMs =
          Number.isFinite(seconds) && seconds > 0
            ? Date.now() + seconds * 1000
            : Date.now() + 10 * 60 * 1000; // fallback 10 min si le backend n’envoie pas retry-after

        localStorage.setItem(SIGNUP_LOCK_KEY, String(untilMs));
        setSignupLockedUntilMs(untilMs);
        setSignupRemainingSec(Math.ceil((untilMs - Date.now()) / 1000));

        // ✅ Message rouge + compteur comme login
        setError(
          `Too many signup attempts. Please try again in ${formatMMSS(
            Math.ceil((untilMs - Date.now()) / 1000)
          )}.`
        );
        return;
      }

      // ✅ 1bis) PASSWORD POLICY (backend) -> afficher sous le champ password + bannière
 // ✅ 1bis) PASSWORD POLICY (backend) -> afficher sous le champ password + bannière
if (!result.success) {
  const backendData = result?.data || null;

  const applied = applyPasswordPolicyBackendError({
    backendData,
    setError,
    setFieldErrors,
    passwordFieldName: "password",
  });

  if (applied) return;
}


      // ✅ 2) succès
      if (result.success) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // ✅ 3) autres erreurs (ex: email déjà utilisé)
      const msg = (result.error || "").toLowerCase();

      if (
        result.status === 409 ||
        msg.includes("email") ||
        msg.includes("already") ||
        msg.includes("exists") ||
        msg.includes("duplicate")
      ) {
        setError("This email is already registered. Please use another email or login.");
        setFieldErrors((prev) => ({ ...prev, email: "Email already in use" }));
        return;
      }

      if (result.status === 400 && (msg.includes("code") || msg.includes("secret"))) {
        setError("Invalid secret code. Please contact the administrator for the correct code.");
        setFieldErrors((prev) => ({ ...prev, secretCode: "Invalid code" }));
        return;
      }

      setError(result.error || "Registration failed. Please try again.");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Quand lock actif, on met à jour le message d’erreur avec le compteur (comme login)
  useEffect(() => {
    if (!isSignupLocked) return;
    setError(`Too many signup attempts. Please try again in ${formatMMSS(signupRemainingSec)}.`);
  }, [isSignupLocked, signupRemainingSec]);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right register-page">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {/* ✅ même design d’erreur que login (box rouge) */}
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-text">✅ {successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.nom}
              onChange={handleChange("nom")}
              error={fieldErrors.nom}
              required
              disabled={isSignupLocked || loading}
            />
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              error={fieldErrors.prenom}
              required
              disabled={isSignupLocked || loading}
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
              disabled={isSignupLocked || loading}
            />
            <Input
              label="Level"
              placeholder="Enter your level"
              value={formData.niveau}
              onChange={handleChange("niveau")}
              error={fieldErrors.niveau}
              required
              disabled={isSignupLocked || loading}
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
                disabled={isSignupLocked || loading}
              />
              <span
                onClick={() => !isSignupLocked && setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "2.3rem",
                  cursor: isSignupLocked ? "not-allowed" : "pointer",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 10,
                  transition: "color 0.2s",
                  opacity: isSignupLocked ? 0.5 : 1,
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
              disabled={isSignupLocked || loading}
            />

            <Button
              text={
                isSignupLocked
                  ? "TRY AGAIN IN 10 MINUTES"
                  : loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"
              }
              className="btn-create"
              type="submit"
              disabled={loading || isSignupLocked}
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
