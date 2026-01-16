import React, { useState, useEffect, useRef } from "react";
import { searchUsers } from "../api/postAPI"; // Assurez-vous d'avoir créé cette fonction
import "../styles/TopBar.css";

const TopBar = ({ onAddPost }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Fermer les résultats si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logique de recherche
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const data = await searchUsers(query);
          setResults(data);
          setShowResults(true);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300); // Délai de 300ms

    return () => clearTimeout(searchTimer);
  }, [query]);

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Search for friends, groups, pages"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowResults(true)}
          />

          {/* Liste déroulante des résultats */}
          {showResults && (
            <div className="search-results-dropdown">
              {results.length > 0 ? (
                results.map((user) => (
                  <div key={user.iduser} className="search-result-item" onClick={() => setShowResults(false)}>
                    <img 
                      src={user.photo || "/default-avatar.png"} 
                      alt="Avatar" 
                      className="result-avatar" 
                    />
                    <div className="result-info">
                      <p className="result-name">{user.nom} {user.prenom}</p>
                      <p className="result-meta">{user.niveau}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">Aucun collègue trouvé pour "{query}"</div>
              )}
            </div>
          )}
        </div>
        
        <button className="add-post-btn" onClick={onAddPost}>
          + Add New Post
        </button>
      </div>
    </div>
  );
};

export default TopBar;