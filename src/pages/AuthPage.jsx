import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AuthPage({ mode: initialMode, onBack }) {
  const { signup, login } = useAuth();
  const { t, dark, toggle } = useTheme();
  const [mode, setMode] = useState(initialMode || "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const C = "'Courier New', Courier, monospace";

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!form.name.trim()) throw new Error("Name is required.");
        if (form.password !== form.confirm) throw new Error("Passwords don't match.");
        if (form.password.length < 6) throw new Error("Password must be 6+ characters.");
        await signup(form.name.trim(), form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      const msg = err.message
        .replace("Firebase: ", "")
        .replace("Error (auth/user-not-found).", "No account with that email.")
        .replace("Error (auth/wrong-password).", "Incorrect password.")
        .replace("Error (auth/email-already-in-use).", "Email already registered.")
        .replace("Error (auth/invalid-email).", "Invalid email address.")
        .replace("Error (auth/too-many-requests).", "Too many attempts. Try again later.");
      setError(msg);
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "12px 14px 12px 42px",
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 8, color: t.text, fontSize: 14,
    fontFamily: C, boxSizing: "border-box", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    marginBottom: 14,
  };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, position: "relative", overflow: "hidden", fontFamily: C,
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
        backgroundSize: "50px 50px",
      }} />
      <div style={{
        position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 500,
        background: `radial-gradient(circle,${t.accentDim} 0%,transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position: "absolute", top: 20, right: 20,
        background: t.bg3, border: `1px solid ${t.border}`,
        borderRadius: 8, padding: "8px 14px",
        color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 13,
      }}>
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: 420,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 18, padding: "36px 32px",
        backdropFilter: "blur(20px)",
        boxShadow: t.shadow,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, margin: "0 auto 12px",
            background: `linear-gradient(135deg, ${t.accent}, ${dark ? "#007755" : "#004d3a"})`,
            clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22, color: "#fff", fontWeight: 900 }}>H</span>
          </div>
          <div style={{ color: t.accent, fontSize: 20, fontWeight: 900, letterSpacing: "0.08em" }}>HackSecure</div>
          <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4, letterSpacing: "0.1em" }}>
            {mode === "login" ? "SIGN IN TO YOUR ACCOUNT" : "CREATE YOUR ACCOUNT"}
          </div>
        </div>

        {/* Toggle tabs */}
        <div style={{
          display: "flex", background: t.bg3,
          border: `1px solid ${t.border}`, borderRadius: 8,
          marginBottom: 24, overflow: "hidden",
        }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setForm({ name: "", email: "", password: "", confirm: "" }); }}
              style={{
                flex: 1, padding: "10px", border: "none", cursor: "pointer",
                background: mode === m ? t.accent : "transparent",
                color: mode === m ? "#fff" : t.textMuted,
                fontWeight: mode === m ? 900 : 400,
                fontSize: 12, fontFamily: C, letterSpacing: "0.08em",
                transition: "all 0.2s",
              }}>
              {m === "login" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: 13, fontSize: 15, opacity: 0.5 }}>👤</span>
              <input type="text" placeholder="Full Name" value={form.name} onChange={set("name")} style={inp}
                onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.accentDim}`; }}
                onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
              />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 13, fontSize: 15, opacity: 0.5 }}>📧</span>
            <input type="email" placeholder="Email Address" value={form.email} onChange={set("email")} style={inp}
              onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.accentDim}`; }}
              onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 13, fontSize: 15, opacity: 0.5 }}>🔐</span>
            <input type="password" placeholder="Password" value={form.password} onChange={set("password")} style={inp}
              onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.accentDim}`; }}
              onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
            />
          </div>
          {mode === "signup" && (
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: 13, fontSize: 15, opacity: 0.5 }}>🔐</span>
              <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={set("confirm")} style={inp}
                onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px ${t.accentDim}`; }}
                onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: `rgba(${dark ? "255,60,60" : "180,0,0"},0.08)`,
              border: `1px solid rgba(${dark ? "255,60,60" : "180,0,0"},0.25)`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              color: t.red, fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 13,
            background: t.accent, color: "#fff",
            border: "none", borderRadius: 8,
            fontWeight: 900, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: C, letterSpacing: "0.06em",
            boxShadow: `0 0 20px ${t.accentGlow}`,
            transition: "all 0.2s", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "PROCESSING..." : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
          </button>
        </form>

        <button onClick={onBack} style={{
          width: "100%", marginTop: 12, padding: 10,
          background: "transparent", border: `1px solid ${t.border}`,
          borderRadius: 8, color: t.textMuted, cursor: "pointer",
          fontFamily: C, fontSize: 12,
        }}>← Back to Site</button>
      </div>
    </div>
  );
}
