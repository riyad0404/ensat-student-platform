import "./../styles/login.css";
import { FiMail, FiLock, FiUser, FiKey } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { user, register } = useAuth(); // ⚠️ Ajoutez `user` ici
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",         
    prenom: "",        
    email: "",
    niveau: "",        
    password: "",
    secretCode: ""     
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ⚠️ Redirige automatiquement si déjà connecté
  useEffect(() => {
    if (user) {
      console.log('✅ Déjà connecté depuis Register, redirection vers /...');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    console.log('=== DEBUG REGISTER ===');
    console.log('1. Données du formulaire:', formData);
    
    // Vérification des champs
    if (!formData.nom || !formData.prenom || !formData.email || 
        !formData.niveau || !formData.password || !formData.secretCode) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    // Validation secretCode
    const secretCodeNum = parseInt(formData.secretCode);
    if (isNaN(secretCodeNum)) {
      setError("Le code secret doit être un nombre");
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        niveau: formData.niveau,
        password: formData.password,
        secretCode: secretCodeNum
      });
      
      console.log('2. Résultat register:', result);
      
      if (result.success) {
        console.log("✅ Inscription réussie!");
        setSuccessMessage(result.message || "Inscription réussie !");
        
        // Réinitialiser le formulaire
        setFormData({
          nom: "",         
          prenom: "",        
          email: "",
          niveau: "",        
          password: "",
          secretCode: ""     
        });
        
        // Afficher un message de succès pendant 3 secondes
        setTimeout(() => {
          setSuccessMessage("");
          navigate('/login');
        }, 3000);
        
      } else {
        setError(result.error || "Erreur d'inscription");
      }
    } catch (err) {
      setError("Une erreur technique est survenue");
      console.error('❌ Exception:', err);
    } finally {
      setLoading(false);
      console.log('=== FIN DEBUG ===');
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // ⚠️ Affichez un message si déjà connecté
  if (user) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2>Vous êtes déjà connecté</h2>
        <p>Vous ne pouvez pas créer un compte supplémentaire.</p>
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Aller à l'accueil
          </button>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Voir mon profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          {error && (
            <div className="error-message" style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "14px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="success-message" style={{
              background: "#d4edda",
              color: "#155724",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "14px"
            }}>
              ✅ {successMessage}
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                Redirection vers la page de connexion dans 3 secondes...
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* NOM */}
            <Input 
              label="Last name" 
              placeholder="Enter Your Last name"
              value={formData.nom}
              onChange={handleChange("nom")}
              required
            />
            
            {/* PRÉNOM */}
            <Input 
              label="First name" 
              placeholder="Enter Your First name"
              value={formData.prenom}
              onChange={handleChange("prenom")}
              required
            />
            
            {/* EMAIL */}
            <Input 
              label="EMAIL" 
              placeholder="Enter Your Email" 
              icon={<FiMail />} 
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
            />
            
            {/* NIVEAU - Utilisez un select pour éviter les erreurs */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Level *
              </label>
              <select
                value={formData.niveau}
                onChange={handleChange("niveau")}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select your level</option>
                <option value="1ère année">1ère année</option>
                <option value="2ème année">2ème année</option>
                <option value="3ème année">3ème année</option>
                <option value="4ème année">4ème année</option>
                <option value="5ème année">5ème année</option>
              </select>
            </div>
            
            {/* PASSWORD */}
            <Input 
              label="PASSWORD" 
              placeholder="Enter Your Password" 
              icon={<FiLock />} 
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              required
              autoComplete="new-password"
            />
            
            {/* CODE SECRET */}
            <Input 
              label="CODE SECRET" 
              placeholder="Enter 6-digit code (ex: 123456)"
              type="number"
              value={formData.secretCode}
              onChange={handleChange("secretCode")}
              required
              min="100000"
              max="999999"
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
            <a 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              style={{ cursor: "pointer", color: "#007bff" }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}