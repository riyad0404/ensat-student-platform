import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ForgotPasswordEmail from "../ResetPassword-email";
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

// Helper pour render avec Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ForgotPasswordEmail – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1 - Affichage du formulaire
  it("affiche le formulaire de réinitialisation par email", () => {
    renderWithRouter(<ForgotPasswordEmail />);

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your email to reset your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  // TEST 2 - Validation email vide
  it("affiche une erreur si l'email est vide", async () => {
    renderWithRouter(<ForgotPasswordEmail />);

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email required/i)).toBeInTheDocument();
    });
  });

  // TEST 3 - Validation email invalide
  it("affiche une erreur si l'email est invalide", async () => {
    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  // TEST 4 - Validation en temps réel
  it("valide l'email en temps réel", async () => {
    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);

    // Taper un email invalide
    fireEvent.change(emailInput, { target: { value: "invalid" } });

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    // Corriger l'email
    fireEvent.change(emailInput, { target: { value: "valid@example.com" } });

    await waitFor(() => {
      expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
    });
  });

  // TEST 5 - Envoi réussi
  it("envoie le lien de réinitialisation avec succès", async () => {
    axios.post.mockResolvedValue({ data: { message: "Email sent" } });

    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/forgot-password",
        { email: "test@example.com" }
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  // TEST 6 - Erreur serveur
  it("affiche une erreur si l'email n'existe pas", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 404,
        data: { error: "Email not found" },
      },
    });

    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "notfound@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address or server problem/i)).toBeInTheDocument();
    });
  });

  // TEST 7 - Bouton disabled pendant le chargement
  it("désactive le bouton pendant l'envoi", async () => {
    axios.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 500))
    );

    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    // Vérifier que le bouton est disabled
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
  });

  // TEST 8 - Navigation vers login
  it("navigue vers la page de login via le lien", () => {
    renderWithRouter(<ForgotPasswordEmail />);

    const loginLink = screen.getByText(/login/i, { selector: "span" });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // TEST 9 - Soumission avec Enter
it("soumet le formulaire en appuyant sur Enter", async () => {
  axios.post.mockResolvedValue({ data: { message: "Email sent" } });

  renderWithRouter(<ForgotPasswordEmail />);

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const form = screen.getByRole("button", { name: /send reset link/i }).closest("form");

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.submit(form);

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalled();
  });
});

  // TEST 10 - Messages d'erreur et de succès sont mutuellement exclusifs
  it("efface le message d'erreur quand le succès arrive", async () => {
    axios.post.mockResolvedValue({ data: { message: "Email sent" } });

    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    // D'abord causer une erreur
    fireEvent.change(emailInput, { target: { value: "invalid" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    // Ensuite corriger et soumettre
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    // Vérifier que l'erreur a disparu
    expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
  });

  // TEST 11 - Icône email est présente
  it("affiche l'icône email dans le champ", () => {
    const { container } = renderWithRouter(<ForgotPasswordEmail />);

    // Vérifier la présence d'une icône SVG
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  // TEST 12 - Le champ email est de type email
  it("utilise le type email pour le champ", () => {
    renderWithRouter(<ForgotPasswordEmail />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });
});