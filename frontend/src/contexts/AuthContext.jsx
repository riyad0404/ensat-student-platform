import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/authAPI";

const AuthContext = createContext();

// Helpers (AJOUT MINIMAL)
const parseRateLimitSeconds = (headers = {}) => {
  // Axios met souvent les headers en minuscules
  const h = {};
  Object.keys(headers || {}).forEach((k) => (h[k.toLowerCase()] = headers[k]));

  // 1) Standard header souvent présent: retry-after (en secondes)
  const retryAfter = h["retry-after"];
  if (retryAfter && !Number.isNaN(Number(retryAfter))) {
    return Math.max(0, Math.floor(Number(retryAfter)));
  }

  // 2) Draft IETF RateLimit headers: ratelimit-reset (souvent timestamp UNIX en secondes)
  const rateLimitReset = h["ratelimit-reset"];
  if (rateLimitReset && !Number.isNaN(Number(rateLimitReset))) {
    const v = Number(rateLimitReset);

    // Heuristique:
    // - si v est "petit" (<= 10^7), ça peut être "secondes restantes"
    // - sinon c'est probablement un timestamp UNIX (secondes)
    if (v <= 10_000_000) return Math.max(0, Math.floor(v));

    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, Math.floor(v - nowSec));
  }

  // 3) Ancien/variante: x-ratelimit-reset (timestamp) ou x-ratelimit-reset-after, etc.
  const xReset = h["x-ratelimit-reset"];
  if (xReset && !Number.isNaN(Number(xReset))) {
    const v = Number(xReset);
    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, Math.floor(v - nowSec));
  }

  const xResetAfter = h["x-ratelimit-reset-after"];
  if (xResetAfter && !Number.isNaN(Number(xResetAfter))) {
    return Math.max(0, Math.floor(Number(xResetAfter)));
  }

  return null; // inconnu
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Vérifie si l'utilisateur est connecté via cookies
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔄 Vérification de la session...");
        const response = await authAPI.verifyToken();

        if (response.user) {
          console.log("✅ Utilisateur connecté:", response.user.email);
          setUser(response.user);
        } else {
          console.log("❌ Pas d'utilisateur dans la réponse");
          setUser(null);
        }
      } catch (error) {
        console.log("⚠️ Non connecté ou session expirée");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ Connexion
  const login = async (credentials) => {
    try {
      console.log("🎯 Tentative de connexion...");
      const data = await authAPI.login(credentials);

      console.log("✅ Réponse backend login:", data);

      if (data.user) {
        console.log("✅ Utilisateur connecté:", data.user.email);
        setUser(data.user);

        setTimeout(() => {
          console.log("🔄 Redirection vers /...");
          navigate("/", { replace: true });
        }, 50);

        return { success: true };
      } else {
        console.error("❌ Pas d'utilisateur dans la réponse");
        return { success: false, error: "User not received" };
      }
    } catch (error) {
      console.error("❌ Erreur login dans contexte:", error);

      const status = error.response?.status;

      // ✅ AJOUT: cas rate limit (429) → renvoyer le temps restant (backend-driven)
      if (status === 429) {
        const seconds = parseRateLimitSeconds(error.response?.headers);
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Too many login attempts. Please try again later.";

        return {
          success: false,
          error: msg,
          errorCode: "RATE_LIMIT",
          retryAfterSeconds: seconds, // peut être null si header absent
        };
      }

      // ✅ Comportement existant conservé (en anglais)
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Incorrect login credentials. Please check your email and password.";

      return { success: false, error: errorMsg };
    }
  };

  // ✅ Inscription
// ✅ Inscription (remplacer seulement cette fonction)
const register = async (userData) => {
  try {
    console.log("📝 Inscription en cours...");
    const result = await authAPI.register(userData);

    console.log("✅ Réponse inscription:", result);

    if (result.message) {
      console.log("✅ Inscription réussie! Redirection vers login...");
      navigate("/login");
      return { success: true, message: result.message };
    }

    // si ton backend renvoie autre chose que {message}, on reste prudent
    return { success: true, ...result };
  } catch (error) {
    console.error("❌ Erreur inscription:", error);

    // authAPI.register peut throw:
    // 1) un AxiosError (error.response...)
    // 2) un objet custom { status, message, data } (comme dans ton authAPI.js)
    const status = error?.response?.status ?? error?.status ?? null;

    // ✅ 429 RATE LIMIT
    if (status === 429) {
      const headers = error?.response?.headers ?? {};
      const seconds = parseRateLimitSeconds(headers); // peut être null si header absent

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Too many signup attempts. Please try again later.";

      return {
        success: false,
        status: 429,
        error: msg,
        errorCode: "RATE_LIMIT",
        retryAfterSeconds: seconds,
      };
    }

    // ✅ autres erreurs: construire un message propre
    const rawMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.data?.message ||
      error?.data?.error ||
      error?.message ||
      "Registration failed. Please try again.";

    const msgLower = String(rawMsg).toLowerCase();

    // ✅ email déjà utilisé (409 ou message)
    if (
      status === 409 ||
      (msgLower.includes("email") &&
        (msgLower.includes("already") ||
          msgLower.includes("exists") ||
          msgLower.includes("duplicate") ||
          msgLower.includes("in use")))
    ) {
      return {
        success: false,
        status: status ?? 409,
        errorCode: "EMAIL_IN_USE",
        error: "This email is already registered. Please use another email or login.",
      };
    }

    // ✅ secret code invalide (400 ou message)
    if (
      status === 400 &&
      (msgLower.includes("secret") || msgLower.includes("code"))
    ) {
      return {
        success: false,
        status: 400,
        errorCode: "INVALID_SECRET_CODE",
        error:
          "Invalid secret code. Please contact the administrator for the correct code.",
      };
    }

    // ✅ fallback
    return {
      success: false,
      status,
      errorCode: "GENERIC",
      error: rawMsg,
    };
  }
};
//deconnexion
  const logout = async () => {
    try {
      console.log("👋 Déconnexion en cours...");
      await authAPI.logout();
    } catch (error) {
      console.error("⚠️ Erreur logout:", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  // ✅ Mise à jour du profil
  const updateProfile = async (updatedData) => {
    try {
      console.log("🔄 Mise à jour du profil...", updatedData);
      const response = await authAPI.updateProfile(updatedData);
      console.log("✅ Profil mis à jour:", response);

      // Always fetch latest user data from backend after update
      const me = await authAPI.verifyToken();
      if (me.user) {
        setUser(me.user);
        return { success: true, user: me.user };
      } else {
        return { success: false, error: "Profile not updated" };
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour profil:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Update error",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
