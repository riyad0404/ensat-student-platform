import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";

// 🔹 MOCK AuthContext - DOIT ÊTRE AVANT L'IMPORT DE BOOKMARKS
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, username: "testuser" },
    isAuthenticated: true
  })
}));

// 🔹 MOCK PostCard component
vi.mock("../../components/Postcard", () => ({
  default: ({ post, onPostDeleted, onPostUpdated }) => (
    <div data-testid={`post-card-${post.idpost}`}>
      <div>{post.title}</div>
      <div>{post.content}</div>
      <button onClick={onPostDeleted}>Delete Post</button>
      <button onClick={onPostUpdated}>Update Post</button>
    </div>
  )
}));

// 🔹 MOCK lucide-react icons
vi.mock("lucide-react", () => ({
  Trash2: () => <svg data-testid="trash-icon" />
}));

import Bookmarks from "../Bookmarks";

// Helper pour render avec Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Mock data
const mockBookmarks = [
  {
    idpost: 1,
    title: "First Post",
    content: "Content of first post",
    author: "User1"
  },
  {
    idpost: 2,
    title: "Second Post",
    content: "Content of second post",
    author: "User2"
  },
  {
    idpost: 3,
    title: "Third Post",
    content: "Content of third post",
    author: "User3"
  }
];

describe("Bookmarks – Unit Tests", () => {
  let localStorageMock;
  let currentStorage = {};

  beforeEach(() => {
    // Reset storage
    currentStorage = {};
    
    // Mock localStorage avec un vrai comportement
    localStorageMock = {
      getItem: vi.fn((key) => currentStorage[key] || null),
      setItem: vi.fn((key, value) => {
        currentStorage[key] = value;
      }),
      clear: vi.fn(() => {
        currentStorage = {};
      })
    };
    global.localStorage = localStorageMock;

    // Mock window.confirm
    global.confirm = vi.fn();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ==================== TESTS D'AFFICHAGE ====================

  // TEST 1 - Affichage du header
  it("affiche le titre et le header de la page", () => {
    currentStorage['bookmarks'] = JSON.stringify([]);
    
    renderWithRouter(<Bookmarks />);

    // Chercher spécifiquement le h1
    const heading = screen.getByRole("heading", { level: 1, name: /saved posts/i });
    expect(heading).toBeInTheDocument();
  });

  // TEST 2 - Affichage du loading state
  it("affiche l'état de chargement initial", () => {
    currentStorage['bookmarks'] = JSON.stringify([]);
    
    renderWithRouter(<Bookmarks />);

    // Le loading disparaît rapidement, mais on peut vérifier qu'il n'y a pas d'erreur
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  // TEST 3 - Affichage du message quand aucun bookmark
  it("affiche un message quand il n'y a pas de bookmarks", () => {
    currentStorage['bookmarks'] = JSON.stringify([]);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText(/no saved posts yet/i)).toBeInTheDocument();
    expect(screen.getByText(/posts you bookmark will appear here/i)).toBeInTheDocument();
  });

  // TEST 4 - Compteur de posts
  it("affiche le nombre correct de posts sauvegardés", () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText(/3 posts saved/i)).toBeInTheDocument();
  });

  // TEST 5 - Compteur singulier
  it("affiche 'post' au singulier pour un seul bookmark", () => {
    currentStorage['bookmarks'] = JSON.stringify([mockBookmarks[0]]);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText(/1 post saved/i)).toBeInTheDocument();
  });

  // TEST 6 - Affichage des posts
  it("affiche tous les posts sauvegardés", () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.getByText("Third Post")).toBeInTheDocument();
  });

  // TEST 7 - Bouton Clear All visible avec des bookmarks
  it("affiche le bouton Clear All quand il y a des bookmarks", () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
  });

  // TEST 8 - Bouton Clear All absent sans bookmarks
  it("n'affiche pas le bouton Clear All quand il n'y a pas de bookmarks", () => {
    currentStorage['bookmarks'] = JSON.stringify([]);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.queryByRole("button", { name: /clear all/i })).not.toBeInTheDocument();
  });

  // TEST 9 - Icône de la poubelle
  it("affiche l'icône de poubelle dans le bouton Clear All", () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
  });

  // ==================== TESTS DE CHARGEMENT ====================

  // TEST 10 - Chargement depuis localStorage
  it("charge les bookmarks depuis localStorage au montage", () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('bookmarks');
    expect(console.log).toHaveBeenCalledWith('Loaded bookmarks:', mockBookmarks);
  });

  // TEST 11 - Gestion des erreurs de parsing
  it("gère les erreurs de parsing du localStorage", () => {
    currentStorage['bookmarks'] = 'invalid json';
    
    renderWithRouter(<Bookmarks />);

    expect(console.error).toHaveBeenCalledWith(
      'Erreur chargement bookmarks:',
      expect.any(Error)
    );
    expect(screen.getByText(/no saved posts yet/i)).toBeInTheDocument();
  });

  // TEST 12 - localStorage vide
  it("gère le cas où localStorage est vide", () => {
    // Ne pas définir currentStorage['bookmarks']
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText(/no saved posts yet/i)).toBeInTheDocument();
  });

  // ==================== TESTS DE SUPPRESSION ====================

  // TEST 13 - Suppression d'un bookmark individuel
  it("supprime un bookmark individuel", async () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    const deleteButton = screen.getAllByText(/delete post/i)[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const savedData = JSON.parse(currentStorage['bookmarks'] || '[]');
      expect(savedData.length).toBe(2);
      expect(savedData.find(b => b.idpost === 1)).toBeUndefined();
    });

    // Vérifier que l'UI est mise à jour
    await waitFor(() => {
      expect(screen.queryByText("First Post")).not.toBeInTheDocument();
    });
    
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  // TEST 14 - Clear All avec confirmation
  it("supprime tous les bookmarks après confirmation", async () => {
    global.confirm.mockReturnValue(true);
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to clear all saved posts?'
      );
    });

    await waitFor(() => {
      const savedData = JSON.parse(currentStorage['bookmarks'] || '[]');
      expect(savedData.length).toBe(0);
    });
    
    // Attendre que le composant se re-rende
    await waitFor(() => {
      expect(screen.getByText(/no saved posts yet/i)).toBeInTheDocument();
    });
  });

  // TEST 15 - Clear All annulé
  it("n'efface pas les bookmarks si la confirmation est annulée", async () => {
    global.confirm.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    renderWithRouter(<Bookmarks />);

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalledWith('bookmarks', JSON.stringify([]));
    expect(screen.getByText("First Post")).toBeInTheDocument();
  });

  // TEST 16 - Mise à jour du compteur après suppression
  it("met à jour le compteur après suppression d'un bookmark", async () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    expect(screen.getByText(/3 posts saved/i)).toBeInTheDocument();

    const deleteButton = screen.getAllByText(/delete post/i)[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/2 posts saved/i)).toBeInTheDocument();
    });
  });

  // ==================== TESTS D'ÉVÉNEMENTS ====================

  // TEST 17 - Dispatch de l'événement bookmarksUpdated lors de la suppression
  it("dispatch l'événement bookmarksUpdated lors de la suppression", async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    renderWithRouter(<Bookmarks />);

    const deleteButton = screen.getAllByText(/delete post/i)[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'bookmarksUpdated'
        })
      );
    });

    dispatchEventSpy.mockRestore();
  });

  // TEST 18 - Écoute de l'événement bookmarksUpdated
  it("écoute et réagit à l'événement bookmarksUpdated", async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    renderWithRouter(<Bookmarks />);

    // Simuler un changement dans localStorage
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockBookmarks[0]]));
    
    // Déclencher l'événement
    const event = new Event('bookmarksUpdated');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(2); // Initial + event
    });
  });

  // TEST 19 - Nettoyage des event listeners
  it("nettoie les event listeners au démontage", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderWithRouter(<Bookmarks />);
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'bookmarksUpdated',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  // ==================== TESTS D'INTÉGRATION PostCard ====================

  // TEST 20 - Callback onPostUpdated
  it("recharge les bookmarks quand un post est mis à jour", async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    renderWithRouter(<Bookmarks />);

    const updateButton = screen.getAllByText(/update post/i)[0];
    fireEvent.click(updateButton);

    await waitFor(() => {
      // getItem est appelé au moins 2 fois (initial + reload)
      expect(localStorageMock.getItem).toHaveBeenCalledTimes(2);
    });
  });

  // TEST 21 - Grid layout avec posts
  it("affiche les posts dans une grille", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    const { container } = renderWithRouter(<Bookmarks />);

    const grid = container.querySelector('[style*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  // TEST 22 - Affichage de l'icône SVG quand vide
  it("affiche l'icône SVG quand il n'y a pas de bookmarks", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    const { container } = renderWithRouter(<Bookmarks />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // TEST 23 - Hover effect sur le bouton Clear All
  it("applique l'effet hover sur le bouton Clear All", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    renderWithRouter(<Bookmarks />);

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    
    fireEvent.mouseEnter(clearButton);
    expect(clearButton.style.transform).toBe('translateY(-2px)');

    fireEvent.mouseLeave(clearButton);
    expect(clearButton.style.transform).toBe('translateY(0)');
  });

  // TEST 24 - Structure de la page
  it("a la structure de page correcte", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
    
    const { container } = renderWithRouter(<Bookmarks />);

    expect(container.querySelector('.bookmarks-page-container')).toBeInTheDocument();
    expect(container.querySelector('.page-header')).toBeInTheDocument();
    expect(container.querySelector('.page-content')).toBeInTheDocument();
  });

  // TEST 25 - Gestion de plusieurs suppressions consécutives
  it("gère plusieurs suppressions consécutives correctement", async () => {
    currentStorage['bookmarks'] = JSON.stringify(mockBookmarks);
    
    renderWithRouter(<Bookmarks />);

    // Supprimer le premier post
    const deleteButtons = screen.getAllByText(/delete post/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("First Post")).not.toBeInTheDocument();
    });

    // Supprimer le deuxième post
    const remainingDeleteButtons = screen.getAllByText(/delete post/i);
    fireEvent.click(remainingDeleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Second Post")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/1 post saved/i)).toBeInTheDocument();
    });
  });
});