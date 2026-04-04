import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!password) return alert("Enter password");

    localStorage.setItem("admin_key", password);
    onLogin(); // 👈 go to admin page
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
    </div>
  );
}