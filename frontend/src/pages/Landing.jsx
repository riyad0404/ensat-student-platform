import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        body {
          background: #fcfbff;
          color: #1f2937;
        }

        /* ================= HEADER ================= */
        header {
          height: 72px;
          padding: 0 96px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 1px solid #eee;
        }

        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #7c3aed;
          letter-spacing: 1px;
        }

        .nav-actions {
          display: flex;
          gap: 16px;
        }

        .btn-outline {
          background: transparent;
          border: 1.5px solid #7c3aed;
          color: #7c3aed;
          padding: 10px 22px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          background: linear-gradient(90deg, #7c3aed, #a855f7);
          border: none;
          color: white;
          padding: 10px 22px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        /* ================= HERO ================= */
        .hero {
          padding: 120px 96px;
          background: linear-gradient(180deg, #ffffff, #f4f2ff);
        }

        .hero-inner {
          max-width: 720px;
        }

        .hero h1 {
          font-size: 56px;
          line-height: 1.15;
          margin-bottom: 24px;
        }

        .hero p {
          font-size: 18px;
          color: #4b5563;
          margin-bottom: 36px;
        }

        .hero button {
          padding: 14px 34px;
          font-size: 16px;
          border-radius: 14px;
          border: none;
          background: #7c3aed;
          color: white;
          cursor: pointer;
        }

        /* ================= SECTION ================= */
        section {
          padding: 120px 96px;
        }

        .section-title {
          font-size: 40px;
          margin-bottom: 90px;
          color: #6d28d9;
        }

        /* ================= FEATURE ================= */
        .feature {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          margin-bottom: 140px;
        }

        .feature.reverse {
          direction: rtl;
        }

        .feature.reverse * {
          direction: ltr;
        }

        .feature h3 {
          font-size: 28px;
          margin-bottom: 16px;
        }

        .feature p {
          font-size: 17px;
          line-height: 1.7;
          color: #4b5563;
        }

        .visual {
          height: 280px;
          border-radius: 28px;
          background: linear-gradient(135deg, #ede9fe, #f8f7ff);
          box-shadow: 0 30px 60px rgba(124,58,237,0.12);
        }

        /* ================= CTA ================= */
        .cta {
          background: #f4f2ff;
          text-align: center;
          padding: 120px 96px;
        }

        .cta h2 {
          font-size: 38px;
          margin-bottom: 20px;
        }

        .cta p {
          font-size: 18px;
          color: #4b5563;
          margin-bottom: 36px;
        }

        /* ================= FOOTER ================= */
        footer {
          background: #faf9ff;
          text-align: center;
          padding: 28px;
          color: #6b7280;
          font-size: 14px;
        }

        @media (max-width: 900px) {
          header, section, .hero, .cta {
            padding: 64px 28px;
          }

          .feature {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 40px;
          }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="logo">DOCENTRA</div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <h1>
            Une plateforme académique
            <br />
            conçue pour les étudiants ENSA
          </h1>
          <p>
            Docentra centralise les documents, facilite la recherche
            d’étudiants, la gestion des profils, les publications anonymes
            et la collaboration académique.
          </p>
          <button onClick={() => navigate("/register")}>
            Commencer maintenant
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <section>
        <h2 className="section-title">Fonctionnalités clés</h2>

        <div className="feature">
          <div>
            <h3>Recherche & profils étudiants</h3>
            <p>
              Recherchez des étudiants par nom ou niveau et consultez leurs
              profils publics contenant leurs publications visibles.
            </p>
          </div>
          <div className="visual" />
        </div>

        <div className="feature reverse">
          <div>
            <h3>Profil personnel & publications anonymes</h3>
            <p>
              Chaque étudiant dispose d’un espace personnel lui permettant
              de consulter ses posts normaux et ses publications anonymes,
              visibles uniquement par lui.
            </p>
          </div>
          <div className="visual" />
        </div>

        <div className="feature">
          <div>
            <h3>Mur collaboratif & bibliothèque</h3>
            <p>
              Partagez des documents, des ressources et des questions.
              Tous les fichiers sont automatiquement classés par niveau.
            </p>
          </div>
          <div className="visual" />
        </div>

        <div className="feature reverse">
          <div>
            <h3>Discussions, groupes & chatbot</h3>
            <p>
              Collaborez à travers des discussions thématiques, des groupes
              privés et bénéficiez d’un chatbot d’assistance académique.
            </p>
          </div>
          <div className="visual" />
        </div>
      </section>

      {/* CTA */}
      <div className="cta">
        <h2>Rejoignez Docentra</h2>
        <p>
          Une plateforme claire, moderne et pensée pour la réussite
          académique.
        </p>
        <button onClick={() => navigate("/register")}>
          Créer un compte
        </button>
      </div>

      {/* FOOTER */}
      <footer>
        © {new Date().getFullYear()} Docentra — ENSA Tanger
      </footer>
    </>
  );
};

export default Landing;
