import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password) return alert("Enter password");

    try {
      // 🔥 API check first (verify password)
      const res = await fetch(
        "https://dental-backend-3kfz.onrender.com/api/patients/today",
        {
          headers: {
            Authorization: `Bearer ${password}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Wrong password");
      }

      // ✅ only if correct → save + open admin
      localStorage.setItem("admin_key", password);
      setError("");
      onLogin();

    } catch (err) {
      setError("❌ Wrong password");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Login</h2>

      <input
        type="password"
        placeholder="Enter Admin Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}