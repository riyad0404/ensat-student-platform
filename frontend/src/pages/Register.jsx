// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { FiMail, FiLock , FiEye, FiEyeOff  } from "react-icons/fi";
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
  
  const [fieldErrors, setFieldErrors] = useState({
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
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        if (!value) return "Email requis";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Format d'email invalide";
        }
        return "";
        
      case "password":
        if (!value) return "Mot de passe requis";
        if (value.length < 6) return "Minimum 6 caractères";
        return "";
        
      case "secretCode":
        if (!value) return "Code secret requis";
        if (!/^\d{6}$/.test(value)) return "6 chiffres requis";
        return "";
        
      case "nom":
      case "prenom":
        if (!value) return "Champ requis";
        if (value.length < 2) return "Minimum 2 caractères";
        return "";
        
      case "niveau":
        if (!value) return "Niveau requis";
        return "";
        
      default:
        return "";
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Validation en temps réel
    const errorMsg = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: errorMsg
    }));
    
    // Réinitialiser l'erreur générale quand l'utilisateur modifie un champ
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const { nom, prenom, email, niveau, password, secretCode } = formData;

    // Validation complète
    const newErrors = {
      nom: validateField("nom", nom),
      prenom: validateField("prenom", prenom),
      email: validateField("email", email),
      niveau: validateField("niveau", niveau),
      password: validateField("password", password),
      secretCode: validateField("secretCode", secretCode)
    };

    setFieldErrors(newErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(newErrors).some(err => err !== "");
    if (hasErrors) {
      setError("Veuillez vérifier les informations saisies.");
      return;
    }

    // Convertir secretCode en nombre
    const secretCodeNum = parseInt(secretCode);
    if (isNaN(secretCodeNum)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        secretCode: "Le code secret doit être un nombre." 
      }));
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
        setSuccessMessage("Compte créé avec succès ! Redirection...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // 🎯 Message d'erreur personnalisé - Email déjà existant
        setError(" Cet email est déjà enregistré. Veuillez utiliser un autre email ou vous connecter.");
        setFieldErrors(prev => ({
          ...prev,
          email: "Email déjà utilisé"
        }));
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      
      // 🎯 Gestion des erreurs HTTP avec messages personnalisés
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || "";
      
      console.log("Status:", status);
      console.log("Server message:", serverMessage);
      
      // Analyse du message d'erreur pour détecter le type
      const errorLower = serverMessage.toLowerCase();
      
      if (
        status === 409 || 
        errorLower.includes("email") ||
        errorLower.includes("already") ||
        errorLower.includes("existe") ||
        errorLower.includes("duplicate") ||
        errorLower.includes("déjà")
      ) {
        // 📧 Email déjà existant
        setError("Cet email est déjà enregistré. Veuillez utiliser un autre email ou vous connecter.");
        setFieldErrors(prev => ({
          ...prev,
          email: "Email déjà utilisé"
        }));
      } 
      else if (
        status === 400 &&
        (errorLower.includes("code") || errorLower.includes("secret"))
      ) {
        // 🔐 Code secret invalide
        setError(" Code secret invalide. Veuillez contacter l'administrateur pour obtenir le bon code.");
        setFieldErrors(prev => ({
          ...prev,
          secretCode: "Code invalide"
        }));
      }
      else if (status === 400) {
        // ⚠️ Données invalides
        setError(" Les informations saisies sont invalides. Veuillez vérifier tous les champs.");
      }
      else if (status === 500) {
        // 🔧 Erreur serveur
        setError(" Erreur du serveur. Veuillez réessayer dans quelques instants.");
      } 
      else if (err.message === "Network Error" || !navigator.onLine) {
        // 🌐 Problème de connexion
        setError(" Problème de connexion internet. Veuillez vérifier votre connexion.");
      }
      else {
        // ❌ Erreur générique
        setError("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
      }
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

        <div className="login-right register-page">
          <h2>Créer un Compte</h2>
          <p className="subtitle">Bienvenue dans la communauté</p>

          {error && <div className="error-text"> {error}</div>}
          {successMessage && <div className="success-text">✅ {successMessage}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Nom"
              placeholder="Entrez votre nom"
              value={formData.nom}
              onChange={handleChange("nom")}
              error={fieldErrors.nom}
              required
            />
            <Input
              label="Prénom"
              placeholder="Entrez votre prénom"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              error={fieldErrors.prenom}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Entrez votre email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange("email")}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Niveau"
              placeholder="Entrez votre niveau"
              value={formData.niveau}
              onChange={handleChange("niveau")}
              error={fieldErrors.niveau}
              required
            />
           <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"

                value={formData.password}
                onChange={handleChange("password")}
                error={fieldErrors.password}
                required
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute',
                  right: '1rem',
                  top: '2.3rem',
                  cursor: 'pointer',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 10,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4a90e2'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <Input
              label="Code Secret"
              type="number"
              placeholder="Entrez le code à 6 chiffres"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              error={fieldErrors.secretCode}
              required
              min="100000"
              max="999999"
            />

            <Button
              text={loading ? "CRÉATION EN COURS..." : "CRÉER UN COMPTE"}
              className="btn-create"
              type="submit"
              disabled={loading}
            />
          </form>

          <p className="redirect">
            Vous avez déjà un compte ?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }} 
            >
              Se connecter
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}