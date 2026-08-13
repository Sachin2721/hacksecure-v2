import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SHIELD_ICON = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path
      d="M24 4L6 12V24C6 34.4 13.9 44.1 24 47C34.1 44.1 42 34.4 42 24V12L24 4Z"
      fill="url(#shieldGrad)"
    />
    <path
      d="M18 24l4 4 8-8"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="47" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00ffcc" />
        <stop offset="1" stopColor="#007755" />
      </linearGradient>
    </defs>
  </svg>
);

const LOCK_ICON = "🔒";
const WA_ICON = "💬";
const PERSON_ICON = "👤";
const MAIL_ICON = "📧";
const NOTE_ICON = "📝";

export default function LeadCapturePage({ service, onProceed, onSkip }) {
  const { t, dark } = useTheme();
  const C = "'Courier New', Courier, monospace";

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    requirement: "",
    email: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.whatsapp.trim()) return setError("Please enter your WhatsApp number.");
    if (form.whatsapp.replace(/\D/g, "").length < 7) return setError("Enter a valid WhatsApp number.");
    if (!form.requirement.trim()) return setError("Please describe your requirement.");
    if (!agreed) return setError("Please accept the terms and conditions to proceed.");

    setLoading(true);
    try {
      await addDoc(collection(db, "leads"), {
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        requirement: form.requirement.trim(),
        email: form.email.trim() || null,
        serviceId: service?.id || null,
        serviceTitle: service?.title || null,
        submittedAt: serverTimestamp(),
        status: "new",
      });
      setSubmitted(true);
      // Mark permanently so form is never shown again on this browser
      localStorage.setItem("hs_lead_done", "1");
      // After 1.4s show the success then proceed
      setTimeout(() => onProceed(), 1800);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inpBase = {
    width: "100%",
    padding: "12px 14px 12px 42px",
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: 10,
    color: t.text,
    fontSize: 14,
    fontFamily: C,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    marginBottom: 14,
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = t.accent;
    e.target.style.boxShadow = `0 0 0 3px ${t.accentDim}`;
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = t.inputBorder;
    e.target.style.boxShadow = "none";
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", background: t.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: C, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
          backgroundSize: "50px 50px",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          background: `radial-gradient(circle,${t.accentDim} 0%,transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "relative", zIndex: 2, textAlign: "center",
          animation: "fadeUp 0.5s ease",
        }}>
          <div style={{
            fontSize: 72, marginBottom: 20,
            animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
          }}>✅</div>
          <div style={{
            color: t.accent, fontSize: "clamp(1.4rem,3vw,2rem)",
            fontWeight: 900, letterSpacing: "0.04em", marginBottom: 10,
          }}>Request Submitted!</div>
          <div style={{ color: t.textSub, fontSize: 15, maxWidth: 360, margin: "0 auto" }}>
            Our team will reach out on WhatsApp within <span style={{ color: t.accent }}>24 hours</span>. 
            Taking you to the service now…
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{
              width: 180, height: 4, background: t.accentDim,
              borderRadius: 2, margin: "0 auto", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", background: t.accent, borderRadius: 2,
                animation: "fillBar 1.8s linear forwards",
              }} />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes fadeUp { from { opacity:0;transform:translateY(24px) } to { opacity:1;transform:none } }
          @keyframes popIn { from { transform:scale(0.5);opacity:0 } to { transform:scale(1);opacity:1 } }
          @keyframes fillBar { from { width:0% } to { width:100% } }
        `}</style>
      </div>
    );
  }

  // ── Form Screen ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: t.bg,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 20px 60px",
      position: "relative", overflow: "hidden", fontFamily: C,
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
        backgroundSize: "50px 50px",
      }} />

      {/* Glow blob */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 700,
        background: `radial-gradient(circle,${t.accentDim} 0%,transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Corner decorations */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, borderRight: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, borderRadius: "0 0 100% 0", opacity: 0.4 }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 180, height: 180, borderLeft: `1px solid ${t.border}`, borderTop: `1px solid ${t.border}`, borderRadius: "100% 0 0 0", opacity: 0.4 }} />

      <div style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: 560,
      }}>

        {/* ── Header card ─────────────────────────────────────────────── */}
        <div style={{
          background: t.accentDim,
          border: `1px solid ${t.border}`,
          borderRadius: "18px 18px 0 0",
          padding: "28px 32px 24px",
          borderBottom: `1px solid ${t.border}`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative scan line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
            animation: "scanLine 3s ease-in-out infinite",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>{SHIELD_ICON}</div>
            <div>
              <div style={{
                color: t.accent, fontSize: 10, letterSpacing: "0.18em",
                marginBottom: 6, fontWeight: 700,
              }}>● HACKSECURE — FREELANCE CYBER SECURITY</div>
              <h1 style={{
                color: t.text,
                fontSize: "clamp(1.2rem,2.5vw,1.6rem)",
                fontWeight: 900, lineHeight: 1.25, margin: 0,
              }}>
                Hello, Welcome to the<br />
                <span style={{ color: t.accent }}>Cyber Security World</span> 🌐
              </h1>
              <p style={{
                color: t.textSub, fontSize: 13.5, lineHeight: 1.75,
                marginTop: 12, marginBottom: 0,
              }}>
                We are working as <span style={{ color: t.text, fontWeight: 700 }}>freelancers</span>, dealing in both{" "}
                <span style={{ color: t.accent }}>ethical</span> as well as{" "}
                <span style={{ color: dark ? "#ffcc00" : "#b8860b" }}>unethical</span> services according to requirement.
                If you want any service, feel free to fill the form below —
                our team will reach out within{" "}
                <span style={{ color: t.accent, fontWeight: 700 }}>24 hours</span>.
              </p>
            </div>
          </div>

          {/* Service pill (if coming from a specific service) */}
          {service && (
            <div style={{
              marginTop: 18,
              display: "inline-flex", alignItems: "center", gap: 8,
              background: dark ? "rgba(0,255,204,0.07)" : "rgba(0,100,70,0.08)",
              border: `1px solid ${t.border}`,
              borderRadius: 30, padding: "5px 14px",
            }}>
              <span style={{ fontSize: 16 }}>{service.emoji}</span>
              <span style={{ color: t.accent, fontSize: 12, fontWeight: 700 }}>
                Interested in: {service.title}
              </span>
            </div>
          )}
        </div>

        {/* ── Form card ───────────────────────────────────────────────── */}
        <div style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderTop: "none",
          borderRadius: "0 0 18px 18px",
          padding: "28px 32px 32px",
          backdropFilter: "blur(20px)",
          boxShadow: dark ? `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${t.border}` : t.shadow,
        }}>

          <div style={{
            color: t.accent, fontSize: 10, letterSpacing: "0.16em",
            marginBottom: 20, fontWeight: 700,
          }}>REQUIRED DETAILS</div>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ position: "relative", marginBottom: 0 }}>
              <span style={{ position: "absolute", left: 13, top: 13, fontSize: 15, opacity: 0.55, zIndex: 1 }}>{PERSON_ICON}</span>
              <input
                type="text"
                placeholder="Your Full Name *"
                value={form.name}
                onChange={set("name")}
                style={inpBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
                maxLength={80}
              />
            </div>

            {/* WhatsApp */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: 13, fontSize: 15, opacity: 0.55, zIndex: 1 }}>{WA_ICON}</span>
              <input
                type="tel"
                placeholder="WhatsApp Number * (e.g. +91 98765 43210)"
                value={form.whatsapp}
                onChange={set("whatsapp")}
                style={inpBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
                maxLength={20}
              />
            </div>

            {/* Requirement */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: 14, fontSize: 15, opacity: 0.55, zIndex: 1 }}>{NOTE_ICON}</span>
              <textarea
                placeholder="Describe your requirement / what you need help with *"
                value={form.requirement}
                onChange={set("requirement")}
                style={{
                  ...inpBase,
                  padding: "12px 14px 12px 42px",
                  height: 110,
                  resize: "vertical",
                  minHeight: 90,
                  maxHeight: 220,
                }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                maxLength={800}
              />
            </div>

            {/* Email (optional) */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: 13, fontSize: 15, opacity: 0.55, zIndex: 1 }}>{MAIL_ICON}</span>
              <input
                type="email"
                placeholder="Email Address (Optional)"
                value={form.email}
                onChange={set("email")}
                style={inpBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
                maxLength={120}
              />
            </div>

            {/* ── Terms & Conditions ──────────────────────────────────── */}
            <div style={{
              background: dark ? "rgba(0,255,204,0.04)" : "rgba(0,100,70,0.04)",
              border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "16px 18px",
              marginBottom: 18, marginTop: 4,
            }}>
              <div style={{
                color: t.accent, fontSize: 10, letterSpacing: "0.16em",
                marginBottom: 12, fontWeight: 700,
              }}>TERMS & CONDITIONS</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "🔒", text: "Your data and privacy are 100% safe with us. We never share your information with third parties." },
                  { icon: "💰", text: "Payment: 5% advance to start the work, and 95% after the work is fully completed." },
                  { icon: "↩️", text: "Refund Policy: You can get a full refund anytime, without any questions asked." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <span style={{ color: t.textSub, fontSize: 12.5, lineHeight: 1.65 }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Checkbox */}
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                marginTop: 16, cursor: "pointer",
              }}>
                <div
                  onClick={() => setAgreed(p => !p)}
                  style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${agreed ? t.accent : t.inputBorder}`,
                    background: agreed ? t.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                  {agreed && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
                <span
                  onClick={() => setAgreed(p => !p)}
                  style={{ color: t.textSub, fontSize: 12.5, lineHeight: 1.6 }}
                >
                  I have read and agree to the above terms and conditions, and I understand the payment and refund policy.
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: `rgba(${dark ? "255,60,60" : "180,0,0"},0.08)`,
                border: `1px solid rgba(${dark ? "255,60,60" : "180,0,0"},0.25)`,
                borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                color: t.red, fontSize: 13,
              }}>⚠ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px 20px",
                background: loading ? `${t.accent}99` : t.accent,
                color: "#fff", border: "none", borderRadius: 10,
                fontWeight: 900, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: C, letterSpacing: "0.06em",
                boxShadow: loading ? "none" : `0 0 28px ${t.accentGlow}`,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = `0 0 40px ${t.accentGlow}`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = loading ? "none" : `0 0 28px ${t.accentGlow}`; }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  SUBMITTING…
                </>
              ) : (
                <>🚀 SUBMIT & PROCEED TO SERVICE</>
              )}
            </button>
          </form>

          {/* Skip link */}
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              onClick={onSkip}
              style={{
                background: "none", border: "none", color: t.textMuted,
                fontSize: 12, cursor: "pointer", fontFamily: C,
                textDecoration: "underline", opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            >
              ← Go back to site
            </button>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div style={{
          marginTop: 20, display: "flex", gap: 20, justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "🔒", label: "100% Confidential" },
            { icon: "⏰", label: "24hr Response" },
            { icon: "↩️", label: "No-Questions Refund" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", gap: 6, alignItems: "center",
              color: t.textMuted, fontSize: 11, fontFamily: C,
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanLine {
          0%,100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
