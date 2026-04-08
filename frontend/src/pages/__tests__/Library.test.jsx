import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Library from "../Library";

// 🔹 MOCK lucide-react icons
vi.mock("lucide-react", () => ({
  BookOpen: () => <svg data-testid="book-icon" />
}));

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

describe("Library – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to get a card by filiere name
  const getCardByFiliereName = (name) => {
    // Le h3 contient le nom, on remonte jusqu'à la div avec display: flex; flex-direction: column (la carte)
    const heading = screen.getByText(name);
    let card = heading.parentElement;
    while (card && !card.style.flexDirection) {
      card = card.parentElement;
    }
    return card;
  };

  // ==================== TESTS D'AFFICHAGE ====================

  // TEST 1 - Affichage du header
  it("affiche le titre et la description de la page", () => {
    renderWithRouter(<Library />);

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText(/select your study level to access documents/i)).toBeInTheDocument();
  });

  // TEST 2 - Affichage de toutes les filières
  it("affiche toutes les 7 filières", () => {
    renderWithRouter(<Library />);

    expect(screen.getByText("Classes Préparatoires")).toBeInTheDocument();
    expect(screen.getByText("Génie Informatique")).toBeInTheDocument();
    expect(screen.getByText("Génie Industriel et Logistique")).toBeInTheDocument();
    expect(screen.getByText("Génie des Systèmes de Réseaux")).toBeInTheDocument();
    expect(screen.getByText("Génie énergétique et Environnement Industriel")).toBeInTheDocument();
    expect(screen.getByText("Génie des Systèmes Electroniques et Automatique")).toBeInTheDocument();
    expect(screen.getByText("Génie des Systèmes et Cybersécurité")).toBeInTheDocument();
  });

  // TEST 3 - Affichage des icônes
  it("affiche une icône pour chaque filière", () => {
    renderWithRouter(<Library />);

    const icons = screen.getAllByTestId("book-icon");
    expect(icons).toHaveLength(7);
  });

  // TEST 4 - Affichage des selects
  it("affiche un select pour chaque filière", () => {
    renderWithRouter(<Library />);

    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(7);
  });

  // TEST 5 - Structure de la page
  it("a la structure de page correcte", () => {
    const { container } = renderWithRouter(<Library />);

    expect(container.querySelector(".library-page-container")).toBeInTheDocument();
    expect(container.querySelector(".page-header")).toBeInTheDocument();
    expect(container.querySelector(".page-content")).toBeInTheDocument();
  });

  // TEST 6 - Grid layout
  it("affiche les filières dans une grille", () => {
    const { container } = renderWithRouter(<Library />);

    const grid = container.querySelector('[style*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  // ==================== TESTS DES NIVEAUX ====================

  // TEST 7 - Options du select Classes Préparatoires
  it("affiche les niveaux corrects pour Classes Préparatoires", () => {
    renderWithRouter(<Library />);

    const prepCard = getCardByFiliereName("Classes Préparatoires");
    const select = within(prepCard).getByRole("combobox");
    
    const options = within(select).getAllByRole("option");
    expect(options).toHaveLength(3); // "Select Level" + AP1 + AP2
    expect(within(select).getByText("AP1")).toBeInTheDocument();
    expect(within(select).getByText("AP2")).toBeInTheDocument();
  });

  // TEST 8 - Options du select GINF
  it("affiche les niveaux corrects pour Génie Informatique", () => {
    renderWithRouter(<Library />);

    const ginfCard = getCardByFiliereName("Génie Informatique");
    const select = within(ginfCard).getByRole("combobox");
    
    expect(within(select).getByText("GINF1")).toBeInTheDocument();
    expect(within(select).getByText("GINF2")).toBeInTheDocument();
    expect(within(select).getByText("GINF3")).toBeInTheDocument();
  });

  // TEST 9 - Option par défaut du select
  it("affiche 'Select Level' comme option par défaut", () => {
    renderWithRouter(<Library />);

    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      expect(within(select).getByText("Select Level")).toBeInTheDocument();
    });
  });

  // TEST 10 - Option par défaut est disabled
  it("l'option 'Select Level' est disabled", () => {
    renderWithRouter(<Library />);

    const select = screen.getAllByRole("combobox")[0];
    const defaultOption = within(select).getByText("Select Level");
    expect(defaultOption).toHaveAttribute("disabled");
  });

  // ==================== TESTS DE NAVIGATION ====================

  // TEST 11 - Navigation vers AP1
  it("navigue vers /library/ap1 quand AP1 est sélectionné", () => {
    renderWithRouter(<Library />);

    const prepCard = getCardByFiliereName("Classes Préparatoires");
    const select = within(prepCard).getByRole("combobox");
    
    fireEvent.change(select, { target: { value: "AP1" } });

    expect(mockNavigate).toHaveBeenCalledWith("/library/ap1");
  });

  // TEST 12 - Navigation vers GINF2
  it("navigue vers /library/ginf2 quand GINF2 est sélectionné", () => {
    renderWithRouter(<Library />);

    const ginfCard = getCardByFiliereName("Génie Informatique");
    const select = within(ginfCard).getByRole("combobox");
    
    fireEvent.change(select, { target: { value: "GINF2" } });

    expect(mockNavigate).toHaveBeenCalledWith("/library/ginf2");
  });

  // TEST 13 - Navigation en lowercase
  it("convertit les niveaux en minuscules pour la navigation", () => {
    renderWithRouter(<Library />);

    const ginfCard = getCardByFiliereName("Génie Informatique");
    const select = within(ginfCard).getByRole("combobox");
    
    fireEvent.change(select, { target: { value: "GINF3" } });

    expect(mockNavigate).toHaveBeenCalledWith("/library/ginf3");
    expect(mockNavigate).not.toHaveBeenCalledWith("/library/GINF3");
  });

  // TEST 14 - Pas de navigation si option par défaut
  it("ne navigue pas si 'Select Level' est sélectionné", () => {
    renderWithRouter(<Library />);

    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "" } });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // TEST 15 - Navigation indépendante par filière
  it("permet de naviguer depuis différentes filières indépendamment", () => {
    renderWithRouter(<Library />);

    // Naviguer depuis Prépa
    const prepCard = getCardByFiliereName("Classes Préparatoires");
    const prepSelect = within(prepCard).getByRole("combobox");
    fireEvent.change(prepSelect, { target: { value: "AP1" } });

    expect(mockNavigate).toHaveBeenCalledWith("/library/ap1");

    mockNavigate.mockClear();

    // Naviguer depuis GINF
    const ginfCard = getCardByFiliereName("Génie Informatique");
    const ginfSelect = within(ginfCard).getByRole("combobox");
    fireEvent.change(ginfSelect, { target: { value: "GINF1" } });

    expect(mockNavigate).toHaveBeenCalledWith("/library/ginf1");
  });

  // ==================== TESTS DES CARTES ====================

  // TEST 16 - Hover effect sur les cartes
  it("applique l'effet hover sur les cartes", () => {
    renderWithRouter(<Library />);

    const card = getCardByFiliereName("Classes Préparatoires");
    
    // Hover
    fireEvent.mouseEnter(card);
    expect(card.style.borderColor).toBe("rgb(0, 64, 208)");

    // Leave
    fireEvent.mouseLeave(card);
    expect(card.style.borderColor).toBe("rgb(229, 231, 235)");
  });

  // TEST 17 - Style des cartes
  it("applique le style correct aux cartes", () => {
    renderWithRouter(<Library />);

    const card = getCardByFiliereName("Classes Préparatoires");
    
    // Vérifier quelques propriétés clés
    expect(card.style.background).toBe("white");
    expect(card.style.borderRadius).toBe("16px");
    expect(card.style.padding).toBe("24px");
  });

  // TEST 18 - Icône avec le bon background
  it("affiche les icônes avec le bon style", () => {
    const { container } = renderWithRouter(<Library />);

    const iconContainers = container.querySelectorAll('[style*="background: rgb(240, 245, 255)"]');
    expect(iconContainers.length).toBeGreaterThanOrEqual(7);
  });

  // ==================== TESTS DE CONTENU ====================

  // TEST 19 - Toutes les filières ont des niveaux
  it("chaque filière a au moins un niveau disponible", () => {
    renderWithRouter(<Library />);

    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      const options = within(select).getAllByRole("option");
      // Au moins 2 options (Select Level + 1 niveau minimum)
      expect(options.length).toBeGreaterThanOrEqual(2);
    });
  });

  // TEST 20 - Nombre correct d'options pour chaque filière
  it("affiche le bon nombre d'options pour chaque filière", () => {
    renderWithRouter(<Library />);

    // Classes Prépa: 2 niveaux
    const prepCard = getCardByFiliereName("Classes Préparatoires");
    const prepOptions = within(within(prepCard).getByRole("combobox")).getAllByRole("option");
    expect(prepOptions).toHaveLength(3); // Select Level + 2

    // GINF: 3 niveaux
    const ginfCard = getCardByFiliereName("Génie Informatique");
    const ginfOptions = within(within(ginfCard).getByRole("combobox")).getAllByRole("option");
    expect(ginfOptions).toHaveLength(4); // Select Level + 3
  });

  // TEST 21 - Toutes les filières d'ingénieur ont 3 niveaux
  it("toutes les filières d'ingénieur ont 3 niveaux", () => {
    renderWithRouter(<Library />);

    const engineeringFilieres = [
      "Génie Informatique",
      "Génie Industriel et Logistique",
      "Génie des Systèmes de Réseaux",
      "Génie énergétique et Environnement Industriel",
      "Génie des Systèmes Electroniques et Automatique",
      "Génie des Systèmes et Cybersécurité"
    ];

    engineeringFilieres.forEach(filiere => {
      const card = getCardByFiliereName(filiere);
      const options = within(within(card).getByRole("combobox")).getAllByRole("option");
      expect(options).toHaveLength(4); // Select Level + 3 niveaux
    });
  });

  // TEST 22 - Style du select
  it("applique le style correct aux selects", () => {
    renderWithRouter(<Library />);

    const select = screen.getAllByRole("combobox")[0];
    
    expect(select).toHaveStyle({
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "rgb(249, 250, 251)"
    });
  });

  // TEST 23 - Layout responsive des cartes
  it("utilise un grid responsive pour les cartes", () => {
    const { container } = renderWithRouter(<Library />);

    // Chercher la div avec display: grid
    const gridDiv = container.querySelector('[style*="display: grid"]');
    expect(gridDiv).toBeInTheDocument();
    expect(gridDiv.style.gridTemplateColumns).toContain("minmax(280px, 1fr)");
  });

  // TEST 24 - Titre de chaque carte
  it("affiche le titre correct pour chaque filière", () => {
    renderWithRouter(<Library />);

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(7);
    
    const titleTexts = titles.map(t => t.textContent);
    expect(titleTexts).toContain("Classes Préparatoires");
    expect(titleTexts).toContain("Génie Informatique");
    expect(titleTexts).toContain("Génie des Systèmes et Cybersécurité");
  });

  // TEST 25 - Accessibilité des selects
  it("les selects sont accessibles", () => {
    renderWithRouter(<Library />);

    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      expect(select).toBeInTheDocument();
      expect(select).not.toBeDisabled();
    });
  });
});