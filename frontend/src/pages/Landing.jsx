import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* ================= GLOBAL ================= */
        body {
          margin: 0;
          background: #ffffff;
          color: #1f2937;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        /* ================= HEADER (INCHANGÉ) ================= */
        header {
          width: 100%;
          height: 9vh;
          min-height: 64px;
          padding: 0 6%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.12);

          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
        }

        .logo {
          font-size: clamp(22px, 2.2vw, 28px);
          font-weight: 800;
          color: #7c3aed;
          cursor: pointer;
          user-select: none;
        }

        .nav-actions {
          display: flex;
          gap: 1vw;
          margin-right: 2vw;
        }

        .btn-auth {
          background: linear-gradient(
            90deg,
            #A6048E,
            #E334FE,
            #7c3aed
          );
          background-size: 200% 200%;
          animation: gradientMove 4s ease infinite;

          color: #ffffff;
          padding: 1.1vh 2vw;
          border-radius: 999px;

          font-size: 0.95rem;
          font-weight: 500;

          border: none;
          cursor: pointer;
          white-space: nowrap;

          transition: transform 0.15s ease;
        }

        .btn-auth:hover {
          transform: translateY(-1px);
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 600px) {
          header { padding: 0 4%; }
          .nav-actions { gap: 2vw; margin-right: 0; }
        }

        /* ================= HERO / BIENVENUE ================= */
        .hero {
          width: 100%;
          min-height: 100vh;
          background: #ffffff;

          /* espace sous header fixed */
          padding-top: 12vh;

          display: flex;
          align-items: flex-start;  /* vers le haut */
          justify-content: center;  /* centré horizontalement */
        }

        .hero-card {
          width: min(78%, 920px);
          margin-top: 4vh; /* un peu vers le haut */
          padding: 5vh 4vw;

          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 26px;

          box-shadow: 0 22px 50px rgba(124, 58, 237, 0.10);
          position: relative;
          overflow: hidden;
        }

        /* halo décoratif doux (pro, pas chargé) */
        .hero-card::before {
          content: "";
          position: absolute;
          top: -40%;
          left: -20%;
          width: 60%;
          height: 80%;
          background: radial-gradient(
            circle,
            rgba(166, 4, 142, 0.18),
            rgba(227, 52, 254, 0.10),
            transparent 70%
          );
          filter: blur(8px);
          pointer-events: none;
        }

        .hero-card::after {
          content: "";
          position: absolute;
          bottom: -45%;
          right: -25%;
          width: 65%;
          height: 90%;
          background: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.14),
            rgba(227, 52, 254, 0.08),
            transparent 70%
          );
          filter: blur(10px);
          pointer-events: none;
        }

        .welcome {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .welcome-title {
          font-size: clamp(24px, 3.2vw, 40px);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 1.6vh;

          /* titre en move */
          background: linear-gradient(90deg, #A6048E, #E334FE, #7c3aed);
          background-size: 200% 200%;
          animation: titleMove 4s ease infinite;

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @keyframes titleMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .welcome-subtitle {
          font-size: clamp(15px, 1.35vw, 17px);
          color: #4b5563;
          line-height: 1.9;
          margin: 0 auto;
          max-width: 82%;
        }

        /* petit séparateur élégant */
        .divider {
          width: 14%;
          min-width: 90px;
          height: 4px;
          margin: 3vh auto;

          border-radius: 999px;
          background: linear-gradient(90deg, #A6048E, #E334FE, #7c3aed);
          background-size: 200% 200%;
          animation: titleMove 4s ease infinite;
          opacity: 0.85;
        }

        .micro-copy {
          font-size: clamp(13px, 1.1vw, 14px);
          color: #6b7280;
          margin-top: 2vh;
        }

        @media (max-width: 900px) {
          .hero-card {
            width: 88%;
            padding: 4.5vh 5vw;
          }

          .welcome-subtitle {
            max-width: 100%;
            text-align: left;
          }

          .welcome {
            text-align: left;
          }

          .divider {
            margin-left: 0;
          }
        }

        @media (max-width: 600px) {
          .hero {
            padding-top: 14vh;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header>
        <div className="logo" onClick={() => navigate("/")}>
          DOCENTRA
        </div>

        <div className="nav-actions">
          <button className="btn-auth" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-auth" onClick={() => navigate("/register")}>
            Sign up
          </button>
        </div>
      </header>

      {/* ================= BIENVENUE / DEFINITION ================= */}
      <div className="hero">
        <div className="hero-card">
          <div className="welcome">
            <div className="welcome-title">Bienvenue sur Docentra</div>

            <div className="welcome-subtitle">
              Ici, l’étudiant ENSA ne perd plus de temps à “chercher partout”.
              Docentra réunit dans un seul espace ce qui se disperse habituellement :
              trouver rapidement un étudiant, poser une question, échanger en privé,
              collaborer en groupe, partager des ressources et accéder aux documents utiles
              sans se noyer dans des messages, des liens et des fichiers introuvables.
              <br /><br />
              L’idée est simple : moins de friction, plus de clarté — et une expérience académique
              structurée, pensée pour le quotidien.
            </div>

            <div className="divider" />

            <div className="micro-copy">
              Docentra — une base claire pour apprendre, partager et avancer ensemble.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
