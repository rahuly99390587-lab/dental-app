import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password) return setError("⚠️ Enter password");

    try {
      const res = await fetch(
        "https://dental-backend-3kfz.onrender.com/api/patients/today",
        {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      localStorage.setItem("admin_key", password);
      setError("");
      onLogin();
    } catch {
      setError("❌ Wrong password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        <h2 style={styles.title}>🦷 Admin Login</h2>
        <p style={styles.subtitle}>Secure access to dashboard</p>

        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f4c81, #1a6eb5)",
  },

  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  title: {
    marginBottom: "0.5rem",
    color: "#0f4c81",
    fontWeight: "800",
  },

  subtitle: {
    marginBottom: "1.5rem",
    color: "#64748b",
    fontSize: "0.9rem",
  },

  input: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    marginBottom: "1rem",
    outline: "none",
    fontSize: "0.9rem",
  },

  button: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #0f4c81, #1a6eb5)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  error: {
    marginTop: "1rem",
    color: "red",
    fontSize: "0.85rem",
  },
};