import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <header style={styles.navbar}>
        <h2 style={styles.logo}>Docentra</h2>
        <div>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.registerBtn}>Get Started</Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          One place to <span style={styles.highlight}>share</span>,{" "}
          <span style={styles.highlight}>learn</span> &{" "}
          <span style={styles.highlight}>collaborate</span>
        </h1>

        <p style={styles.subtitle}>
          Docentra is a student platform designed for ENSAT students to share
          documents, ask questions, publish posts and help each other succeed.
        </p>

        <div style={styles.actions}>
          <Link to="/register" style={styles.primaryBtn}>
            Create an account
          </Link>
          <Link to="/login" style={styles.secondaryBtn}>
            I already have an account
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <div style={styles.featureCard}>
          <h3>📚 Document Library</h3>
          <p>Access shared documents classified by academic level.</p>
        </div>

        <div style={styles.featureCard}>
          <h3>💬 Posts & Comments</h3>
          <p>Ask questions, publish posts and interact with classmates.</p>
        </div>

        <div style={styles.featureCard}>
          <h3>🎓 ENSAT Community</h3>
          <p>A collaborative space built by students, for students.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Docentra — ENSAT Student Platform</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    borderBottom: "1px solid #eee",
  },

  logo: {
    color: "#a020f0",
    fontWeight: "bold",
  },

  link: {
    marginRight: "20px",
    textDecoration: "none",
    color: "#555",
    fontWeight: "500",
  },

  registerBtn: {
    textDecoration: "none",
    padding: "10px 18px",
    background: "linear-gradient(90deg, #d633ff, #a020f0)",
    color: "#fff",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  hero: {
    textAlign: "center",
    padding: "80px 20px",
    maxWidth: "900px",
    margin: "0 auto",
  },

  title: {
    fontSize: "42px",
    marginBottom: "20px",
    color: "#222",
  },

  highlight: {
    color: "#a020f0",
  },

  subtitle: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "40px",
    lineHeight: 1.6,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 26px",
    background: "linear-gradient(90deg, #d633ff, #a020f0)",
    color: "#fff",
    borderRadius: "25px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  secondaryBtn: {
    padding: "14px 26px",
    border: "2px solid #a020f0",
    color: "#a020f0",
    borderRadius: "25px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  features: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    padding: "60px 40px",
    flexWrap: "wrap",
  },

  featureCard: {
    width: "260px",
    padding: "25px",
    borderRadius: "15px",
    backgroundColor: "#fafafa",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  footer: {
    marginTop: "auto",
    padding: "20px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
};
