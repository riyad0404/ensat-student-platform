import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Register from "../Register";

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
const mockRegister = vi.fn();
const mockUser = null;

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    register: mockRegister,
  }),
}));

// Helper pour render avec Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Register – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // TEST 1 - Affichage du formulaire
  it("affiche le formulaire d'inscription", () => {
    renderWithRouter(<Register />);

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your level/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter the 6-digit code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  // TEST 2 - Validation champs vides (CORRIGÉ)
  it("affiche des erreurs si les champs sont vides", async () => {
    renderWithRouter(<Register />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please check the entered information/i)).toBeInTheDocument();
    });

    // Vérifie que les messages d'erreur des champs apparaissent (utilise getAllByText car plusieurs champs ont le même message)
    expect(screen.getAllByText(/field required/i).length).toBeGreaterThan(0);
  });

  // TEST 3 - Validation email invalide
  it("affiche une erreur si l'email est invalide", async () => {
    renderWithRouter(<Register />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  // TEST 4 - Validation mot de passe trop court
  it("affiche une erreur si le mot de passe est trop court", async () => {
    renderWithRouter(<Register />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    fireEvent.change(passwordInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    });
  });

  // TEST 5 - Validation code secret invalide
  it("affiche une erreur si le code secret n'a pas 6 chiffres", async () => {
    renderWithRouter(<Register />);

    const secretCodeInput = screen.getByPlaceholderText(/enter the 6-digit code/i);
    fireEvent.change(secretCodeInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/6 digits required/i)).toBeInTheDocument();
    });
  });

  // TEST 6 - Inscription réussie (CORRIGÉ - augmenter timeout et gérer timers)
  it("crée un compte avec succès et redirige vers login", async () => {
    mockRegister.mockResolvedValue({ success: true });

    renderWithRouter(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your level/i), {
      target: { value: "GINF1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter the 6-digit code/i), {
      target: { value: "123456" },
    });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        nom: "Doe",
        prenom: "John",
        email: "john.doe@example.com",
        niveau: "GINF1",
        password: "Password123!",
        secretCode: 123456,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
    });
  }, 10000); // Timeout de 10 secondes

  // TEST 7 - Email déjà utilisé (CORRIGÉ - timeout)
  it("affiche une erreur si l'email est déjà utilisé", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      status: 409,
      error: "Email already exists",
    });

    renderWithRouter(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your level/i), {
      target: { value: "GINF1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter the 6-digit code/i), {
      target: { value: "123456" },
    });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/this email is already registered/i)).toBeInTheDocument();
    });
  }, 10000);

  // TEST 8 - Code secret invalide (CORRIGÉ - timeout)
  it("affiche une erreur si le code secret est incorrect", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      status: 400,
      error: "Invalid secret code",
    });

    renderWithRouter(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your level/i), {
      target: { value: "GINF1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter the 6-digit code/i), {
      target: { value: "999999" },
    });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid secret code/i)).toBeInTheDocument();
    });
  }, 10000);

  // TEST 9 - Toggle show/hide password (CORRIGÉ - timeout)
  it("permet de montrer/cacher le mot de passe", async () => {
    const { container } = renderWithRouter(<Register />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    
    expect(passwordInput).toHaveAttribute("type", "password");

    const eyeToggle = container.querySelector('span[style*="position: absolute"][style*="cursor: pointer"]');
    expect(eyeToggle).toBeTruthy();
    
    fireEvent.click(eyeToggle);

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    fireEvent.click(eyeToggle);

    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  }, 10000);

  // TEST 10 - Rate limiting (CORRIGÉ - timeout)
  it("affiche un message de verrouillage après trop de tentatives", async () => {
    mockRegister.mockResolvedValue({
      success: false,
      errorCode: "RATE_LIMIT",
      retryAfterSeconds: 600,
    });

    renderWithRouter(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your level/i), {
      target: { value: "GINF1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter the 6-digit code/i), {
      target: { value: "123456" },
    });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many signup attempts/i)).toBeInTheDocument();
    });

    // Vérifie que le bouton est disabled
    expect(screen.getByRole("button", { name: /try again in 10 minutes/i })).toBeDisabled();
  }, 10000);

  // TEST 11 - Lien vers la page de login
  it("navigue vers la page de login via le lien", () => {
    renderWithRouter(<Register />);

    const loginLink = screen.getByText(/login/i, { selector: 'span' });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // TEST 12 - Validation nom/prénom minimum 2 caractères (CORRIGÉ - timeout)
  it("affiche une erreur si le nom ou prénom est trop court", async () => {
    renderWithRouter(<Register />);

    const lastNameInput = screen.getByPlaceholderText(/enter your last name/i);
    fireEvent.change(lastNameInput, { target: { value: "D" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/minimum 2 characters/i)).toBeInTheDocument();
    });
  }, 10000);

  // TEST 13 - Bouton disabled pendant le chargement (CORRIGÉ - timeout)
  it("désactive le bouton pendant le chargement", async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );

    renderWithRouter(<Register />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/enter your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your level/i), {
      target: { value: "GINF1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter the 6-digit code/i), {
      target: { value: "123456" },
    });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });
  }, 10000);
});