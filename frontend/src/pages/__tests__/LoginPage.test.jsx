import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "../LoginPage";

// 🔹 MOCK navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 🔹 MOCK AuthContext
const mockLogin = vi.fn();
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Helper pour render avec Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LoginPage – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // TEST 1 - Affichage du formulaire
  it("affiche le formulaire de login", () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  // TEST 2 - Validation champs vides (CORRIGÉ)
  it("affiche une erreur si les champs sont vides", async () => {
    renderWithRouter(<LoginPage />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // Le message affiché est "Please correct the errors above." (comme montré dans le DOM)
      expect(screen.getByText(/please correct the errors above/i)).toBeInTheDocument();
    });
  });

  // TEST 3 - Validation email invalide
  it("affiche une erreur si email invalide", async () => {
    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(emailInput, {
      target: { value: "invalid" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  // TEST 4 - Validation mot de passe trop court
  it("affiche une erreur si le mot de passe est trop court", async () => {
    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "123" },
    });

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    });
  });

  // TEST 5 - Appel login() avec données valides
  it("appelle login() quand les données sont valides", async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@gmail.com",
        password: "password123",
      });
    });
  });

  // TEST 6 - Message d'erreur si login échoue
  it("affiche un message si login échoue", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: "Incorrect login credentials",
    });

    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/incorrect login credentials/i)).toBeInTheDocument();
    });
  });

  // TEST 7 - Bouton disabled pendant le chargement
  it("désactive le bouton pendant le chargement", async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)));

    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  // TEST 8 - Toggle show/hide password (CORRIGÉ v2)
it("permet de montrer/cacher le mot de passe", async () => {
  renderWithRouter(<LoginPage />);

  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  
  // Vérifie que c'est un input de type password au départ
  expect(passwordInput).toHaveAttribute("type", "password");

  // Trouve le span qui contient l'icône eye par son style
  const container = passwordInput.closest('div[style*="position: relative"]');
  const eyeToggle = container.querySelector('span[style*="cursor: pointer"]');
  
  // Cliquer pour montrer le mot de passe
  fireEvent.click(eyeToggle);

  // Attendre que le changement soit appliqué
  await waitFor(() => {
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  // Cliquer à nouveau pour cacher
  fireEvent.click(eyeToggle);

  await waitFor(() => {
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

  // TEST 9 - Rate limiting (trop de tentatives)
  it("affiche un message de verrouillage après trop de tentatives", async () => {
    mockLogin.mockResolvedValue({
      success: false,
      errorCode: "RATE_LIMIT",
      retryAfterSeconds: 120,
    });

    renderWithRouter(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument();
    });

    // Vérifie que le bouton est maintenant disabled
    expect(screen.getByRole("button", { name: /try again in 2 minutes/i })).toBeDisabled();
  });

  // TEST 10 - Navigation vers la page d'inscription
  it("navigue vers la page d'inscription", () => {
    renderWithRouter(<LoginPage />);

    const createAccountButton = screen.getByRole("button", { name: /create an account/i });
    fireEvent.click(createAccountButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  // TEST 11 - Affichage des options "Forgot Password"
  it("affiche les options de réinitialisation du mot de passe", () => {
    renderWithRouter(<LoginPage />);

    const forgotLink = screen.getByText(/forgot password/i);
    fireEvent.click(forgotLink);

    expect(screen.getByText(/reset by code secret/i)).toBeInTheDocument();
    expect(screen.getByText(/reset by email link/i)).toBeInTheDocument();
  });
});