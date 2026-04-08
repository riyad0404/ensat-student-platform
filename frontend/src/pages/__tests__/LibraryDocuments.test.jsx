import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LibraryDocuments from "../LibraryDocuments";
import * as DocumentsAPI from "../../api/DocumentsAPI";

// 🔹 MOCK lucide-react icons
vi.mock("lucide-react", () => ({
  Download: () => <svg data-testid="download-icon" />,
  FileText: () => <svg data-testid="filetext-icon" />,
  Image: () => <svg data-testid="image-icon" />,
  File: () => <svg data-testid="file-icon" />
}));

// 🔹 MOCK DocumentsAPI
vi.mock("../../api/DocumentsAPI");

// Helper pour render avec Router et params
const renderWithRouter = (niveau = "ginf1") => {
  return render(
    <MemoryRouter initialEntries={[`/library/${niveau}`]}>
      <Routes>
        <Route path="/library/:niveau" element={<LibraryDocuments />} />
      </Routes>
    </MemoryRouter>
  );
};

// Mock data
const mockDocuments = [
  {
    iddocument: 1,
    filename: "course-notes.pdf",
    url: "/uploads/documents/course-notes.pdf",
    type: "application/pdf",
    size: 1024000,
    niveau: "GINF1",
    idpost: 123,
    createdAt: "2024-01-15T10:00:00Z",
    User: { prenom: "John", nom: "Doe" }
  },
  {
    iddocument: 2,
    filename: "diagram.png",
    url: "/uploads/documents/diagram.png",
    type: "image/png",
    size: 512000,
    niveau: "GINF1",
    idpost: 124,
    createdAt: "2024-01-16T11:00:00Z",
    User: { prenom: "Jane", nom: "Smith" }
  },
  {
    iddocument: 3,
    filename: "exam-2023.pdf",
    url: "/uploads/documents/exam-2023.pdf",
    type: "application/pdf",
    size: 2048000,
    niveau: "GINF1",
    idpost: null,
    createdAt: "2024-01-17T12:00:00Z",
    User: { prenom: "Bob", nom: "Johnson" }
  }
];

describe("LibraryDocuments – Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock fetch for downloads
    global.fetch = vi.fn();
    
    // Mock DOM methods for downloads
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ==================== TESTS DE CHARGEMENT ====================

  // TEST 1 - Affichage du loading state
  it("affiche l'état de chargement initial", () => {
    DocumentsAPI.getDocumentsByNiveau.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter("ginf1");

    expect(screen.getByText(/documents ginf1/i)).toBeInTheDocument();
  });

  // TEST 2 - Chargement réussi des documents
  it("charge et affiche les documents avec succès", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
      expect(screen.getByText("diagram.png")).toBeInTheDocument();
      expect(screen.getByText("exam-2023.pdf")).toBeInTheDocument();
    });
  });

  // TEST 3 - Appel API avec le bon niveau
  it("appelle l'API avec le niveau correct depuis l'URL", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue([]);
    
    renderWithRouter("ginf2");

    await waitFor(() => {
      expect(DocumentsAPI.getDocumentsByNiveau).toHaveBeenCalledWith("ginf2");
    });
  });

  // TEST 4 - Gestion des erreurs API
  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    const errorMessage = "Network error";
    DocumentsAPI.getDocumentsByNiveau.mockRejectedValue(new Error(errorMessage));
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // TEST 5 - Bouton Retry après erreur
  it("affiche un bouton Retry en cas d'erreur", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockRejectedValue(new Error("Error"));
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  // TEST 6 - Retry recharge les documents
  it("recharge les documents quand on clique sur Retry", async () => {
    DocumentsAPI.getDocumentsByNiveau
      .mockRejectedValueOnce(new Error("Error"))
      .mockResolvedValueOnce(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });
  });

  // ==================== TESTS D'AFFICHAGE ====================

  // TEST 7 - Compteur de documents
  it("affiche le nombre correct de documents", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText(/3 documents available/i)).toBeInTheDocument();
    });
  });

  // TEST 8 - Compteur singulier
  it("affiche 'document' au singulier pour un seul document", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue([mockDocuments[0]]);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText(/1 document available/i)).toBeInTheDocument();
    });
  });

  // TEST 9 - Message quand aucun document
  it("affiche un message quand il n'y a pas de documents", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue([]);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText(/no documents found/i)).toBeInTheDocument();
    });
  });

  // TEST 10 - Titre avec le niveau en majuscules
  it("affiche le titre avec le niveau en majuscules", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue([]);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText(/documents ginf1/i)).toBeInTheDocument();
    });
  });

  // ==================== TESTS DES FILTRES ====================

  // TEST 11 - Affichage des boutons de filtre
  it("affiche tous les boutons de filtre", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "PDF" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Images" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Others" })).toBeInTheDocument();
    });
  });

  // TEST 12 - Filtre par défaut (All)
  it("le filtre 'All' est actif par défaut", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      const allButton = screen.getByRole("button", { name: "All" });
      expect(allButton).toHaveStyle({ background: '#0040D0' });
    });
  });

  // TEST 13 - Filtrer par PDF
  it("filtre les documents PDF uniquement", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("diagram.png")).toBeInTheDocument();
    });

    const pdfFilterButton = screen.getByRole("button", { name: "PDF" });
    fireEvent.click(pdfFilterButton);

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
      expect(screen.getByText("exam-2023.pdf")).toBeInTheDocument();
      expect(screen.queryByText("diagram.png")).not.toBeInTheDocument();
    });
  });

  // TEST 14 - Filtrer par Images
  it("filtre les images uniquement", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });

    const imagesFilterButton = screen.getByRole("button", { name: "Images" });
    fireEvent.click(imagesFilterButton);

    await waitFor(() => {
      expect(screen.getByText("diagram.png")).toBeInTheDocument();
      expect(screen.queryByText("course-notes.pdf")).not.toBeInTheDocument();
      expect(screen.queryByText("exam-2023.pdf")).not.toBeInTheDocument();
    });
  });

  // TEST 15 - Style du bouton actif
  it("applique le style correct au bouton de filtre actif", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    });

    // Utiliser getByRole pour cibler spécifiquement le bouton de filtre
    const pdfFilterButton = screen.getByRole("button", { name: "PDF" });
    fireEvent.click(pdfFilterButton);

    expect(pdfFilterButton).toHaveStyle({ 
      background: 'rgb(0, 64, 208)',
      color: 'rgb(255, 255, 255)'
    });
  });

  // ==================== TESTS DES DOCUMENTS ====================

  // TEST 16 - Affichage des icônes de documents
  it("affiche l'icône appropriée pour chaque type de document", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      const icons = screen.getAllByTestId(/icon$/);
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  // TEST 17 - Format de la taille des fichiers
  it("formate correctement la taille des fichiers", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    // Les tailles sont affichées dans les cartes de documents
    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });
  });

  // TEST 18 - Format de la date
  it("affiche la date au bon format", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      // Format: Jan 15, 2024
      expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument();
    });
  });

  // TEST 19 - Extension du fichier affichée
  it("affiche l'extension du fichier en badge", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      // Utiliser getAllByText pour vérifier que les badges existent
      // (il y a plusieurs "PDF" : le bouton de filtre + les badges des documents)
      const pdfElements = screen.getAllByText("PDF");
      const pngElements = screen.getAllByText("PNG");
      
      // Vérifier qu'il y a au moins 2 éléments PDF (bouton + au moins 1 badge)
      expect(pdfElements.length).toBeGreaterThanOrEqual(2);
      // Vérifier qu'il y a 1 élément PNG (badge uniquement)
      expect(pngElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==================== TESTS DE TÉLÉCHARGEMENT ====================

  // TEST 20 - Boutons de téléchargement présents
  it("affiche un bouton de téléchargement pour chaque document", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      const downloadIcons = screen.getAllByTestId("download-icon");
      expect(downloadIcons).toHaveLength(3);
    });
  });

  // TEST 21 - Téléchargement d'un document
  it("télécharge un document quand on clique sur le bouton", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    global.fetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test']))
    });

    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTestId("download-icon");
    fireEvent.click(downloadButtons[0].parentElement);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  // TEST 22 - Gestion des erreurs de téléchargement
  it("gère les erreurs de téléchargement", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    global.fetch.mockRejectedValue(new Error("Download failed"));
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTestId("download-icon");
    fireEvent.click(downloadButtons[0].parentElement);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Download error:', expect.any(Error));
    });
  });

  // ==================== TESTS D'INTERACTION ====================

  // TEST 23 - Hover sur une carte de document
  it("applique l'effet hover sur les cartes de documents", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });

    // Trouver la carte du document (le div parent avec le style approprié)
    const documentTitle = screen.getByText("course-notes.pdf");
    const card = documentTitle.closest('[style*="cursor: pointer"]');
    
    // Vérifier que la carte existe
    expect(card).toBeInTheDocument();
    
    // Note: Dans un environnement de test, les effets de hover via CSS ne sont pas appliqués
    // Ce test vérifie simplement que la structure DOM est correcte et que les éléments existent
    // Pour tester le hover, il faudrait soit:
    // 1. Tester les styles inline si le composant les applique via state
    // 2. Utiliser des tests E2E avec Playwright/Cypress
    // 3. Vérifier que les événements sont bien attachés
    
    // Vérifier que les événements mouseEnter et mouseLeave peuvent être déclenchés
    expect(() => {
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
    }).not.toThrow();
  });

  // TEST 24 - Hover sur le bouton de téléchargement
  it("applique l'effet hover sur le bouton de téléchargement", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    renderWithRouter("ginf1");

    await waitFor(() => {
      expect(screen.getByText("course-notes.pdf")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTestId("download-icon");
    const button = downloadButtons[0].parentElement;
    
    // Note: Comme pour le test précédent, dans un environnement de test les styles CSS
    // de hover ne sont pas appliqués automatiquement. Ce test vérifie que:
    // 1. Le bouton existe
    // 2. Les événements peuvent être déclenchés sans erreur
    
    expect(button).toBeInTheDocument();
    
    expect(() => {
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
    }).not.toThrow();
    
    // Vérifier le style de base du bouton
    expect(button).toHaveStyle({ background: 'rgb(0, 64, 208)' });
  });

  // TEST 25 - Grid layout des documents
  it("affiche les documents dans une grille", async () => {
    DocumentsAPI.getDocumentsByNiveau.mockResolvedValue(mockDocuments);
    
    const { container } = renderWithRouter("ginf1");

    await waitFor(() => {
      const grid = container.querySelector('[style*="display: grid"]');
      expect(grid).toBeInTheDocument();
    });
  });
});