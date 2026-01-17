import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Replace by local assets if you want */
const HERO_IMG =
  "https://images.unsplash.com/photo-1588072432836-7fb78c5f0b44?auto=format&fit=crop&w=1400&q=80";
const ABOUT_IMG =
  "https://images.unsplash.com/photo-1588072432904-843af37f03ed?auto=format&fit=crop&w=1400&q=80";

export default function Landing() {
  const navigate = useNavigate();

  const features = useMemo(
    () => [
      {
        label: "Search",
        title: "Student profiles & smart lookup",
        desc: "Find students by name or academic level and access public profiles with visible posts and academic identity.",
      },
      {
        label: "Community",
        title: "Wall posts (normal & anonymous)",
        desc: "Ask questions, share resources, and interact through comments. Post anonymously whenever you need privacy.",
      },
      {
        label: "Library",
        title: "Documents organized by level",
        desc: "All shared resources are structured by academic level (AP1 → Engineering cycle) for fast access and clarity.",
      },
      {
        label: "Move Together",
        title: "Groups & topic discussions",
        desc: "Create or join groups, invite classmates, and keep focused discussions for projects and learning circles.",
      },
      {
        label: "Assistant",
        title: "ENSAT academic chatbot",
        desc: "Get quick guidance for common student questions: platform usage, orientation, and academic support.",
      },
    ],
    []
  );

  // Coverflow state
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = () => setActive((p) => (p - 1 + features.length) % features.length);
  const next = () => setActive((p) => (p + 1) % features.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % features.length), 4200);
    return () => clearInterval(t);
  }, [paused, features.length]);

  const rel = (i) => {
    const n = features.length;
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  // ✅ Measure header height and push content down correctly
  const headerRef = useRef(null);
  const [headerH, setHeaderH] = useState(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.getBoundingClientRect().height || 0;
      setHeaderH(Math.ceil(h));
    };

    measure();

    // Observe changes (responsive, font loading, etc.)
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // ✅ Espace entre header et contenu (ajuste ici si tu veux plus/moins)
  // 🔴 MODIF: grand espace
  const HEADER_GAP = 600; // px (mets 220/260 si tu veux encore plus)

  return (
    <>
      <style>{`
        :root{
          --bg:#fbfaff;
          --text:#0f172a;
          --muted:#5b6476;
          --card:#ffffff;
          --line:rgba(140,120,255,.18);

          --p1:#7c3aed;
          --p2:#a855f7;
          --p3:#6d28d9;

          --shadow: 0 2.5vw 6vw rgba(124,58,237,.14);
          --shadow2: 0 1.6vw 4vw rgba(15,23,42,.10);

          --padX: clamp(4%, 6vw, 7%);
        }

        *{ box-sizing:border-box; margin:0; padding:0; font-family: Inter, "Segoe UI", system-ui, -apple-system, Arial, sans-serif; }

        /* ✅ Force a predictable canvas even if App.css is weird */
        html, body { height: 100%; }
        body{
          background:var(--bg);
          color:var(--text);
          overflow-x:hidden;
        }

        /* ✅ Landing isolation to override global wrappers */
        .landingRoot{
          width:100%;
          min-height:100vh;
          position: relative;
          background: var(--bg);
        }

        /* ✅ HEADER fixed */
        .landingHeader{
          width:100%;
          position: fixed;
          top:0;
          left:0;
          z-index:999;
          background: rgba(251,250,255,.82);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(140,120,255,.18);
        }
        .headerIn{
          width:100%;
          padding: 14px var(--padX);
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 16px;
        }
        .brand{
          display:flex;
          align-items:center;
          gap: 12px;
          cursor:pointer;
          user-select:none;
        }
        .logoMark{
          width: 52px;
          height: 52px;
          border-radius: 28%;
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,.9), rgba(255,255,255,0) 55%),
            linear-gradient(135deg, var(--p1), var(--p2));
          box-shadow: 0 1.2vw 2.6vw rgba(124,58,237,.22);
          flex: 0 0 auto;
        }
        .brandTxt{ display:flex; flex-direction:column; line-height:1.05; }
        .brandTxt .name{
          font-weight: 900;
          letter-spacing: .12em;
          color: var(--p3);
          font-size: 18px;
        }
        .brandTxt .sub{
          font-size: 12px;
          color: #6b7280;
          margin-top: 6px;
        }

        .headerBtns{
          display:flex;
          gap: 12px;
          align-items:center;
          flex: 0 0 auto;
        }
        .btn{
          cursor:pointer;
          border-radius: 999px;
          padding: .7em 1.25em;
          font-weight: 700;
          border: 1px solid rgba(124,58,237,.35);
          background: rgba(255,255,255,.70);
          color: var(--p3);
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          font-size: 14px;
          white-space: nowrap;
        }
        .btn:hover{ box-shadow: 0 .9vw 2vw rgba(124,58,237,.14); }
        .btn:active{ transform: translateY(1px); }
        .btn.primary{
          background: linear-gradient(90deg, var(--p1), var(--p2));
          border-color: transparent;
          color:#fff;
          box-shadow: 0 1vw 2.4vw rgba(124,58,237,.22);
        }

        /* ✅ Content starts under header + gap */
        .landingContent{
          width:100%;
          min-height:100vh;
        }

        .section{
          width:100%;
          padding: clamp(28px, 7vw, 72px) var(--padX);
          position:relative;
        }

        .hero{
          /* ✅ IMPORTANT: no margin-top here (avoid overlap issues) */
          background:
            radial-gradient(70vw 40vw at 18% 0%, rgba(124,58,237,.18), rgba(124,58,237,0) 60%),
            radial-gradient(70vw 40vw at 85% 10%, rgba(168,85,247,.16), rgba(168,85,247,0) 62%),
            linear-gradient(180deg, #ffffff, rgba(244,242,255,1));
          overflow:hidden;
        }

        .heroGrid{
          width:100%;
          display:grid;
          grid-template-columns: 48% 52%;
          gap: 4%;
          align-items:center;
        }

        .heroTitle{
          font-size: clamp(30px, 3.6vw, 60px);
          line-height: 1.08;
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }
        .heroTitle span{ color: var(--p3); }
        .heroText{
          font-size: clamp(14px, 1.25vw, 18px);
          line-height: 1.8;
          color: var(--muted);
          max-width: 95%;
        }
        .badgeRow{
          margin-top: 18px;
          display:flex;
          flex-wrap:wrap;
          gap: 10px;
        }
        .badge{
          padding: .65em 1em;
          border-radius: 999px;
          border: 1px solid rgba(124,58,237,.18);
          background: rgba(255,255,255,.7);
          font-size: 13px;
          color: #4c1d95;
          font-weight: 800;
        }

        .imgShell{
          width:100%;
          border-radius: clamp(20px, 3vw, 44px);
          overflow:hidden;
          box-shadow: var(--shadow);
          border: 1px solid rgba(140,120,255,.18);
          background: rgba(255,255,255,.55);
          position:relative;
        }
        .heroImg{
          width:100%;
          height: clamp(260px, 32vw, 440px);
          object-fit: cover;
          display:block;
          transform: scale(1.02);
          filter: saturate(1.05);
        }

        .about{
          background: linear-gradient(180deg, rgba(244,242,255,1), rgba(251,250,255,1));
          overflow:hidden;
        }
        .aboutGrid{
          display:grid;
          grid-template-columns: 44% 56%;
          gap: 4%;
          align-items:center;
        }
        .aboutImgWrap{
          width:100%;
          border-radius: clamp(18px, 2.6vw, 38px);
          overflow:hidden;
          box-shadow: var(--shadow2);
          border: 1px solid rgba(140,120,255,.18);
          background: rgba(255,255,255,.65);
        }
        .aboutImg{
          width:100%;
          height: clamp(240px, 28vw, 360px);
          object-fit: cover;
          display:block;
        }
        .aboutTitle{
          font-size: clamp(22px, 2.4vw, 40px);
          margin-bottom: 12px;
          color: #1f2a44;
          letter-spacing: -0.02em;
        }
        .aboutText{
          font-size: clamp(14px, 1.15vw, 17px);
          line-height: 1.85;
          color: var(--muted);
          max-width: 95%;
        }

        .features{ background: #ffffff; position:relative; overflow:hidden; }

        .featHeader{
          width:100%;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          margin-bottom: clamp(18px, 3.6vw, 40px);
        }
        .featTitle{
          font-size: clamp(24px, 2.6vw, 44px);
          color: var(--p3);
          letter-spacing: -0.02em;
        }
        .featLine{
          width: clamp(14%, 18vw, 26%);
          height: 4px;
          border-radius: 999px;
          margin-top: 12px;
          background: linear-gradient(90deg, var(--p1), var(--p2));
          opacity: .9;
        }

        .coverflow{ width:100%; position:relative; padding: 2% 0 1%; }
        .stage{
          width:100%;
          height: clamp(320px, 32vw, 460px);
          position:relative;
          perspective: 1200px;
          transform-style: preserve-3d;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .card3d{
          position:absolute;
          width: min(54%, 680px);
          max-width: 86%;
          height: clamp(240px, 24vw, 340px);
          border-radius: clamp(18px, 2.4vw, 34px);
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(140,120,255,.22);
          box-shadow: var(--shadow2);
          backdrop-filter: blur(10px);
          transform-style: preserve-3d;
          transition: transform 600ms cubic-bezier(.2,.85,.2,1), opacity 600ms cubic-bezier(.2,.85,.2,1), filter 600ms;
          overflow:hidden;
        }

        .cardTop{
          padding:2% 5% 2%;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        /* =========================================================
           🔴 MODIFS SLIDER TEXT (centrage + design) — rien d’autre
           ========================================================= */

        .pill{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding: .6em 1.1em;
          border-radius: 999px;
          border: 1px solid rgba(124,58,237,.22);
          background: rgba(124,58,237,.08);
          color: #4c1d95;
          font-weight: 900;
          font-size: 13px;
          letter-spacing: .03em;
          margin-top: 10%;
        }

        .cardBody{
          padding: 0 5% 2%;
          margin-top: 5%;
        }

        .cardBody h3{
          width: 100%;
          text-align:center;
          font-size: clamp(20px, 2vw, 28px);
          margin-bottom: 12px;
          color:#0f172a;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .cardBody p{
          width: min(92%, 560px);
          text-align:center;
          font-size: clamp(13px, 1.15vw, 16px);
          line-height: 1.9;
          color: var(--muted);
          margin: 0 auto;
        }

        /* ========================================================= */

        .navArrows{
          width:100%;
          display:flex;
          justify-content:center;
          gap: 12px;
          margin-top: 18px;
        }
        .arrow{
          width: 52px;
          height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(124,58,237,.22);
          background: rgba(255,255,255,.75);
          cursor:pointer;
          font-weight: 900;
          color:#5b21b6;
        }

        .dots{
          width:100%;
          display:flex;
          justify-content:center;
          gap: 10px;
          margin-top: 14px;
        }
        .dot{
          width: 12px;
          height: 12px;
          border-radius: 999px;
          border: 1px solid rgba(124,58,237,.35);
          background: rgba(124,58,237,.12);
          cursor:pointer;
          transition: width .25s ease, background .25s ease;
        }
        .dot.active{
          width: 34px;
          background: linear-gradient(90deg, var(--p1), var(--p2));
          border-color: rgba(124,58,237,.18);
        }

        /* =========================================================
           ✅ NEW DESIGN "HOW IT WORKS" (ONLY THIS PART CHANGED)
           ========================================================= */

        .how{
          background:
            radial-gradient(60vw 34vw at 18% 10%, rgba(124,58,237,.12), rgba(124,58,237,0) 60%),
            radial-gradient(60vw 34vw at 82% 18%, rgba(168,85,247,.10), rgba(168,85,247,0) 62%),
            linear-gradient(180deg, rgba(255,255,255,1), rgba(244,242,255,1));
          overflow:hidden;
        }

        .howHeader{
          width:100%;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          margin-bottom: clamp(26px, 4.2vw, 56px);
        }

        .howTitle{
          font-size: clamp(26px, 2.8vw, 46px);
          color: var(--p3);
          letter-spacing: -0.02em;
        }

        .howLine{
          width: 160px;
          height: 4px;
          border-radius: 999px;
          margin-top: 12px;
          background: linear-gradient(90deg, var(--p1), var(--p2));
          opacity: .95;
        }

        .howGrid{
          width:100%;
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .howCard{
          position: relative;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(140,120,255,.18);
          border-radius: 22px;
          box-shadow: 0 24px 48px rgba(15,23,42,.12);
          padding: 28px;
          transition: transform .25s ease, box-shadow .25s ease;
          overflow:hidden;
        }

        .howCard::before{
          content:"";
          position:absolute;
          inset:-60px;
          background:
            radial-gradient(circle at 18% 15%, rgba(124,58,237,.22), transparent 55%),
            radial-gradient(circle at 80% 35%, rgba(168,85,247,.18), transparent 58%);
          opacity:.55;
          filter: blur(18px);
          pointer-events:none;
        }

        .howCard:hover{
          transform: translateY(-8px);
          box-shadow: 0 36px 64px rgba(15,23,42,.18);
        }

        .howStep{
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, var(--p1), var(--p2));
          margin-bottom: 16px;
          box-shadow: 0 14px 26px rgba(124,58,237,.22);
          z-index: 1;
        }

        .howCard h3{
          position: relative;
          z-index: 1;
          font-size: 18px;
          margin-bottom: 10px;
          color:#0f172a;
        }

        .howCard p{
          position: relative;
          z-index: 1;
          font-size: 15px;
          line-height: 1.75;
          color: var(--muted);
        }

        /* ========================================================= */

        footer{
          width:100%;
          padding: 24px var(--padX);
          border-top: 1px solid rgba(140,120,255,.14);
          background: rgba(255,255,255,.65);
          text-align:center;
          color:#6b7280;
          font-size: 14px;
        }

        @media (max-width: 980px){
          .heroGrid{ grid-template-columns: 1fr; }
          .aboutGrid{ grid-template-columns: 1fr; }
          .card3d{ width: 92%; }
          .howGrid{ grid-template-columns: 1fr; }
          .logoMark{ width: 46px; height:46px; }
        }
      `}</style>

      <div className="landingRoot">
        {/* HEADER */}
        <header className="landingHeader" ref={headerRef}>
          <div className="headerIn">
            <div className="brand" onClick={() => navigate("/")}>
              <div className="logoMark" />
              <div className="brandTxt">
                <div className="name">DOCENTRA</div>
                <div className="sub">ENSAT Student Platform</div>
              </div>
            </div>

            <div className="headerBtns">
              <button className="btn" onClick={() => navigate("/login")}>
                Sign in
              </button>
              <button className="btn primary" onClick={() => navigate("/register")}>
                Sign up
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT starts under header */}
        <div className="landingContent" style={{ paddingTop: headerH + HEADER_GAP }}>
          {/* HERO */}
          <section className="section hero">
            <div className="heroGrid">
              <div>
                <h1 className="heroTitle">
                  Welcome to <span>Docentra</span>
                  <br />
                  your ENSAT student hub
                </h1>
                <p className="heroText">
                  Docentra centralizes academic documents, supports collaborative posts (normal or anonymous),
                  and improves student communication through groups, discussions, and a dedicated ENSAT chatbot.
                </p>

                <div className="badgeRow">
                  <div className="badge">Library by level</div>
                  <div className="badge">Anonymous posts</div>
                  <div className="badge">Groups & discussions</div>
                  <div className="badge">ENSAT chatbot</div>
                </div>
              </div>

              <div>
                <div className="imgShell">
                  <img className="heroImg" src={HERO_IMG} alt="Docentra hero visual" />
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section className="section about">
            <div className="aboutGrid">
              <div className="aboutImgWrap">
                <img className="aboutImg" src={ABOUT_IMG} alt="About Docentra visual" />
              </div>

              <div>
                <h2 className="aboutTitle">About the platform</h2>
                <p className="aboutText">
                  Docentra is designed for ENSAT daily academic life: students can share resources, ask for help,
                  keep documents organized by level, join or create groups, and maintain focused discussions.
                  The goal is simple: less time searching, more time learning and collaborating.
                </p>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section
            className="section features"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="featHeader">
              <h2 className="featTitle">Key Features</h2>
              <div className="featLine" />
            </div>

            <div className="coverflow">
              <div className="stage">
                {features.map((f, i) => {
                  const d = rel(i);
                  const abs = Math.abs(d);

                  const translateX = d * 26;
                  const rotateY = d * -18;
                  const translateZ = 220 - abs * 120;
                  const scale = 1 - abs * 0.12;

                  const opacity = abs > 2 ? 0 : 1 - abs * 0.18;
                  const blur = abs === 0 ? "blur(0px)" : `blur(${Math.min(2.2, abs * 0.9)}px)`;
                  const zIndex = 100 - abs;

                  return (
                    <div
                      key={i}
                      className="card3d"
                      style={{
                        zIndex,
                        opacity,
                        filter: blur,
                        transform: `
                          translateX(${translateX}%)
                          translateZ(${translateZ}px)
                          rotateY(${rotateY}deg)
                          scale(${scale})
                        `,
                      }}
                      onClick={() => setActive(i)}
                      role="button"
                      aria-label={`Feature ${i + 1}`}
                    >
                      <>
                        <div className="cardTop">
                          <div className="pill">{f.label}</div>
                          <div style={{ width: "1px", height: "1px", opacity: 0 }} />
                        </div>
                        <div className="cardBody">
                          <h3>{f.title}</h3>
                          <p>{f.desc}</p>
                        </div>
                      </>
                    </div>
                  );
                })}
              </div>

              <div className="navArrows">
                <button className="arrow" onClick={prev} aria-label="Previous">
                  ‹
                </button>
                <button className="arrow" onClick={next} aria-label="Next">
                  ›
                </button>
              </div>

              <div className="dots">
                {features.map((_, i) => (
                  <button
                    key={i}
                    className={`dot${i === active ? " active" : ""}`}
                    onClick={() => setActive(i)}
                    aria-label={`Go to feature ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="section how">
            <div className="howHeader">
              <h2 className="howTitle">How it works</h2>
              <div className="howLine" />
            </div>

            <div className="howGrid">
              <div className="howCard">
                <div className="howStep">01</div>
                <h3>Create your account</h3>
                <p>Sign up in seconds and set your academic level to access relevant resources.</p>
              </div>

              <div className="howCard">
                <div className="howStep">02</div>
                <h3>Join your level & groups</h3>
                <p>Connect with classmates through groups and topic discussions for projects and learning.</p>
              </div>

              <div className="howCard">
                <div className="howStep">03</div>
                <h3>Share, ask, collaborate</h3>
                <p>Post questions, share documents, and use the ENSAT chatbot for quick academic support.</p>
              </div>
            </div>
          </section>

          <footer>© {new Date().getFullYear()} Docentra — ENSA Tanger</footer>
        </div>
      </div>
    </>
  );
}