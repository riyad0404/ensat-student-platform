// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau: "",
    password: "",
    secretCode: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const { nom, prenom, email, niveau, password, secretCode } = formData;

    // ✅ Vérification côté frontend
    if (!nom || !prenom || !email || !niveau || !password || !secretCode) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Convertir secretCode en nombre pour éviter undefined
    const secretCodeNum = parseInt(secretCode);
    if (isNaN(secretCodeNum)) {
      setError("Le code secret doit être un nombre");
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
        secretCode: secretCodeNum
      });

      if (result.success) {
        setSuccessMessage(result.message || "Inscription réussie !");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur serveur, veuillez réessayer plus tard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img
            src={registerImg}
            alt="Register Illustration"
            className="login-illustration"
          />
        </div>

        <div className="login-right">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {error && <div className="error-text">⚠️ {error}</div>}
          {successMessage && <div className="success-text">✅ {successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Last Name"
              placeholder="Enter Your Last Name"
              value={formData.nom}
              onChange={handleChange("nom")}
            />
            <Input
              label="First Name"
              placeholder="Enter Your First Name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter Your Email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
            />
            <Input
              label="Level"
              placeholder="Enter Your Level"
              value={formData.niveau}
              onChange={handleChange("niveau")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter Your Password"
              icon={<FiLock />}
              value={formData.password}
              onChange={handleChange("password")}
            />
            <Input
              label="Secret Code"
              type="number"
              placeholder="Enter 6-digit secret code"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
            />

            <Button
              text={loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              className="btn-create"
              type="submit"
              disabled={loading}
            />
          </form>

          <p className="redirect">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "#007bff", cursor: "pointer" }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}



