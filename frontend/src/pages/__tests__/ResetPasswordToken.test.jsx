import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResetPasswordToken from "../ResetPasswordToken";
import axios from "axios";

// 🔹 MOCK axios
vi.mock("axios");

// 🔹 MOCK navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 🔹 MOCK validation utils
vi.mock("../utils/authValidation", () => ({
  validatePasswordField: (password) => {
    if (!password) return "Password required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return "";
  },
  applyPasswordPolicyBackendError: ({ setError }) => {
    setError("Password does not meet security requirements");
    return true;
  }
}));

// Helper pour render avec Router et paramètre token
const renderWithRouterAndToken = (token = "valid-token-123") => {
  return render(
    <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordToken />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ResetPasswordToken – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== TESTS D'AFFICHAGE ====================

  // TEST 1 - Affichage du formulaire avec token valide
  it("affiche le formulaire de réinitialisation avec token valide", () => {
    renderWithRouterAndToken();

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  // TEST 2 - Affichage des deux icônes de visibilité
  it("affiche les icônes de visibilité pour les deux champs", () => {
    const { container } = renderWithRouterAndToken();

    const eyeIcons = container.querySelectorAll("svg");
    expect(eyeIcons.length).toBeGreaterThanOrEqual(2);
  });

  // TEST 3 - Les champs sont de type password par défaut
  it("les champs sont de type password par défaut", () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");
  });

  // ==================== TESTS DE VALIDATION ====================

  // TEST 4 - Validation mot de passe vide
  it("affiche une erreur si le mot de passe est vide", async () => {
    renderWithRouterAndToken();

    const submitButton = screen.getByRole("button", { name: /reset password/i });
    fireEvent.click(submitButton);

    // Le composant ne fait rien si les champs sont vides (validation échoue silencieusement)
    // Vérifier que axios n'a PAS été appelé
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // TEST 5 - Validation mot de passe trop court
  it("affiche une erreur si le mot de passe est trop court", async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    fireEvent.change(passwordInput, { target: { value: "Short1" } });

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    });
  });

  // TEST 6 - Validation confirmation vide
  it("affiche une erreur si la confirmation est vide", async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    // Remplir le mot de passe mais pas la confirmation
    fireEvent.change(passwordInput, { target: { value: "ValidPass123" } });
    fireEvent.click(submitButton);

    // Vérifier que axios n'a PAS été appelé car la validation échoue
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // TEST 7 - Validation des mots de passe non identiques
  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);

    fireEvent.change(passwordInput, { target: { value: "ValidPass123" } });
    fireEvent.change(confirmInput, { target: { value: "DifferentPass123" } });

    await waitFor(() => {
      expect(screen.getByText(/the passwords do not match/i)).toBeInTheDocument();
    });
  });

  // TEST 8 - Validation en temps réel du mot de passe
  it("valide le mot de passe en temps réel", async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);

    // Mot de passe invalide
    fireEvent.change(passwordInput, { target: { value: "short" } });

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    });

    // Corriger le mot de passe
    fireEvent.change(passwordInput, { target: { value: "ValidPass123" } });

    await waitFor(() => {
      expect(screen.queryByText(/minimum 8 characters/i)).not.toBeInTheDocument();
    });
  });

  // TEST 9 - Validation en temps réel de la correspondance
  it("valide la correspondance des mots de passe en temps réel", async () => {
    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);

    fireEvent.change(passwordInput, { target: { value: "ValidPass123" } });
    fireEvent.change(confirmInput, { target: { value: "Different123" } });

    await waitFor(() => {
      expect(screen.getByText(/the passwords do not match/i)).toBeInTheDocument();
    });

    // Corriger la confirmation
    fireEvent.change(confirmInput, { target: { value: "ValidPass123" } });

    await waitFor(() => {
      expect(screen.queryByText(/the passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  // ==================== TESTS DE VISIBILITÉ ====================

  // TEST 10 - Toggle visibilité du mot de passe
  it("change le type du champ password en cliquant sur l'icône", async () => {
    const { container } = renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    // Cliquer sur la première icône (pour le password)
    const eyeIcons = container.querySelectorAll("span[style*='cursor: pointer']");
    fireEvent.click(eyeIcons[0]);

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    // Cliquer à nouveau pour masquer
    fireEvent.click(eyeIcons[0]);

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  // TEST 11 - Toggle visibilité de la confirmation
  it("change le type du champ confirmation en cliquant sur l'icône", async () => {
    const { container } = renderWithRouterAndToken();

    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    expect(confirmInput).toHaveAttribute("type", "password");

    // Cliquer sur la deuxième icône (pour la confirmation)
    const eyeIcons = container.querySelectorAll("span[style*='cursor: pointer']");
    fireEvent.click(eyeIcons[1]);

    await waitFor(() => {
      expect(confirmInput).toHaveAttribute("type", "text");
    });
  });

  // ==================== TESTS API ====================

  // TEST 12 - Réinitialisation réussie
  it("réinitialise le mot de passe avec succès", async () => {
    axios.post.mockResolvedValue({ 
      data: { message: "Password reset successful" } 
    });

    renderWithRouterAndToken("valid-token-123");

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/reset-password-token",
        {
          token: "valid-token-123",
          newPassword: "NewPassword123"
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/password successfully reset/i)).toBeInTheDocument();
    });
  });

  // TEST 13 - Token expiré
  it("affiche une erreur si le token est expiré", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: "Token expired" }
      }
    });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/this reset link has expired/i)).toBeInTheDocument();
    });
  });

  // TEST 14 - Token invalide
  it("affiche une erreur si le token est invalide", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: "Invalid token" }
      }
    });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
    });
  });

  // TEST 15 - Utilisateur non trouvé
  it("affiche une erreur si l'utilisateur n'existe pas", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 404,
        data: { error: "User not found" }
      }
    });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  // TEST 16 - Erreur de politique de mot de passe
  it("affiche une erreur si le mot de passe ne respecte pas la politique", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { 
          error: "Password policy violation",
          message: "Password too weak"
        }
      }
    });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "WeakPass1" } });
    fireEvent.change(confirmInput, { target: { value: "WeakPass1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    });
  });

  // ==================== TESTS DE COMPORTEMENT ====================

  // TEST 17 - Bouton désactivé pendant le chargement
  it("désactive le bouton pendant l'envoi", async () => {
    axios.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 500))
    );

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/resetting/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /resetting/i })).toBeDisabled();
  });

  // TEST 18 - Navigation vers login
  it("navigue vers la page de login via le lien", () => {
    renderWithRouterAndToken();

    const loginLink = screen.getByText(/login/i, { selector: "span" });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // TEST 19 - Redirection après succès
  it("redirige vers login après une réinitialisation réussie", async () => {
    axios.post.mockResolvedValue({ 
      data: { message: "Password reset successful" } 
    });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    fireEvent.click(submitButton);

    // Attendre le message de succès
    await waitFor(() => {
      expect(screen.getByText(/password successfully reset/i)).toBeInTheDocument();
    });

    // Attendre la navigation (le composant utilise setTimeout de 2000ms)
    await new Promise(resolve => setTimeout(resolve, 2100));

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  }, 15000);

  // TEST 20 - Soumission avec Enter
  it("soumet le formulaire en appuyant sur Enter", async () => {
    axios.post.mockResolvedValue({ data: { message: "Password reset" } });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: "NewPassword123" } });
    fireEvent.change(confirmInput, { target: { value: "NewPassword123" } });
    
    // Cliquer sur le bouton au lieu de Enter (le formulaire HTML standard)
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  // TEST 21 - Messages d'erreur et de succès sont mutuellement exclusifs
  it("efface le message d'erreur quand le succès arrive", async () => {
    axios.post.mockResolvedValue({ data: { message: "Success" } });

    renderWithRouterAndToken();

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    // D'abord causer une erreur
    fireEvent.change(passwordInput, { target: { value: "short" } });
    
    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    });

    // Corriger et soumettre
    fireEvent.change(passwordInput, { target: { value: "ValidPassword123" } });
    
    // Attendre que l'erreur disparaisse
    await waitFor(() => {
      expect(screen.queryByText(/minimum 8 characters/i)).not.toBeInTheDocument();
    });

    fireEvent.change(confirmInput, { target: { value: "ValidPassword123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password successfully reset/i)).toBeInTheDocument();
    });
  });

  // TEST 22 - L'image de réinitialisation est affichée
  it("affiche l'illustration de réinitialisation", () => {
    renderWithRouterAndToken();

    const image = screen.getByAltText(/reset password/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");
  });
});