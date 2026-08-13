import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { SERVICES } from "../data/services";

const WHATSAPP = "6285138798883"; // Admin's WhatsApp number in international format without '+' or dashes
const ADMIN_EMAIL = "admin@hacksecure.com";
const WEB3FORMS_KEY = "59dfd499-9e30-415e-92a2-bed61ddcf529";

function openWA(msg) {
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onLoginClick, onProfileClick, onLogout, onLandingClick }) {
  const { t, dark, toggle } = useTheme();
  const { user, profile } = useAuth();
  const C = "'Courier New',monospace";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000,
      background: scrolled ? t.navBg : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${t.border}` : "none",
      transition: "all 0.3s", padding: "0 5%", height: 64,
      display: "flex", alignItems: "center", justifyConent: "space-between",
      justifyContent: "space-between",
      fontFamily: C,
    }}>
      <div
        onClick={onLandingClick}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        title="Go to Landing Page"
      >
        <div style={{
          width: 32, height: 32,
          background: `linear-gradient(135deg,${t.accent},${dark ? "#007755" : "#004d3a"})`,
          clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>H</span>
        </div>
        <span style={{ color: t.accent, fontSize: 20, fontWeight: 900, letterSpacing: "0.08em" }}>HackSecure</span>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="hs-desktop">
        {onLandingClick && (
          <button onClick={onLandingClick} style={{
            background: t.accentDim, border: `1px solid ${t.border}`, borderRadius: 6,
            padding: "4px 10px", cursor: "pointer",
            color: t.accent, fontSize: 12, fontFamily: C, fontWeight: 700,
          }}>
            ← Landing Page
          </button>
        )}
        {["Home", "Services", "About", "Contact"].map(l => (
          <button key={l} onClick={() => l === "Contact" ? openWA("Hi HackSecure!") : scrollTo(l.toLowerCase())} style={{
            background: "none", border: "none", cursor: "pointer",
            color: t.textSub, fontSize: 14, fontFamily: C,
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = t.accent}
            onMouseLeave={e => e.target.style.color = t.textSub}
          >{l === "Contact" ? "📞 Contact" : l}</button>
        ))}

        <button onClick={toggle} style={{
          background: t.bg3, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "6px 12px",
          color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 13,
        }}>{dark ? "☀️" : "🌙"}</button>

        {user ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={onProfileClick} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: t.accentDim, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              color: t.accent, fontFamily: C, fontSize: 13, fontWeight: 700,
            }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent},${dark?"#007755":"#004d3a"})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 900 }}>
                {profile?.avatar || "U"}
              </span>
              {profile?.name?.split(" ")[0] || "Profile"}
            </button>
            <button onClick={onLogout} style={{ background: "none", border: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", padding: "6px 10px", borderRadius: 8, fontFamily: C, fontSize: 11 }}>Out</button>
          </div>
        ) : (
          <button onClick={onLoginClick} style={{
            background: t.accent, color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 18px", fontWeight: 900,
            fontSize: 13, cursor: "pointer", fontFamily: C,
            boxShadow: `0 0 16px ${t.accentGlow}`,
          }}>Sign In →</button>
        )}
      </div>

      <button className="hs-mobile-btn" onClick={() => setOpen(!open)} style={{
        background: "none", border: "none", color: t.text, fontSize: 22, cursor: "pointer", display: "none",
      }}>{open ? "✕" : "☰"}</button>

      {open && (
        <div style={{
          position: "absolute", top: 64, left: 0, width: "100%",
          background: t.navBg, backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: 18,
        }}>
          {["Home", "Services", "About"].map(l => (
            <button key={l} onClick={() => { setOpen(false); scrollTo(l.toLowerCase()); }} style={{
              background: "none", border: "none", color: t.textSub, fontSize: 16, fontFamily: C, cursor: "pointer",
            }}>{l}</button>
          ))}
          <button onClick={() => { setOpen(false); openWA("Hi!"); }} style={{ background: "none", border: "none", color: t.accent, fontSize: 16, fontFamily: C, cursor: "pointer" }}>📞 Contact</button>
          <button onClick={toggle} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 18px", color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 13 }}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
          {user
            ? <button onClick={() => { setOpen(false); onProfileClick(); }} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 900, cursor: "pointer", fontFamily: C }}>My Profile</button>
            : <button onClick={() => { setOpen(false); onLoginClick(); }} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 900, cursor: "pointer", fontFamily: C }}>Sign In</button>
          }
        </div>
      )}
      <style>{`@media(max-width:820px){.hs-desktop{display:none!important}.hs-mobile-btn{display:block!important}}`}</style>
    </nav>
  );
}

// ─── HOME SECTION ─────────────────────────────────────────────────────────────
function HomeSection({ onServiceClick }) {
  const { t, dark } = useTheme();
  const C = "'Courier New',monospace";
  return (
    <section id="home" style={{ minHeight: "100vh", background: t.bg, position: "relative", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: `radial-gradient(circle,${t.accentDim} 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, width: "90%", maxWidth: 1100, margin: "0 auto", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px" }}>
          <div style={{ display: "inline-block", background: t.accentDim, border: `1px solid ${t.border}`, borderRadius: 4, padding: "4px 12px", marginBottom: 20, color: t.accent, fontSize: 11, letterSpacing: "0.12em", fontFamily: C }}>● ETHICAL HACKING PROFESSIONALS</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3.4rem)", fontWeight: 900, lineHeight: 1.15, color: t.text, marginBottom: 20, fontFamily: C }}>
            Secure Your Digital<br />
            <span style={{ color: t.accent, textShadow: dark ? `0 0 30px ${t.accentGlow}` : "none" }}>Infrastructure</span>
          </h1>
          <p style={{ color: t.textSub, lineHeight: 1.7, marginBottom: 32, fontFamily: "Georgia,serif", fontSize: 16, maxWidth: 480 }}>
            Expert penetration testing, vulnerability assessments, and cybersecurity solutions to protect your systems before attackers strike.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("services")} style={{
              background: t.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "13px 28px", fontWeight: 900, fontSize: 14, cursor: "pointer",
              fontFamily: C, boxShadow: `0 0 24px ${t.accentGlow}`, transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
            >Our Services →</button>
            <button onClick={() => scrollTo("contact")} style={{
              background: "transparent", color: t.accent, border: `2px solid ${t.accent}`,
              borderRadius: 8, padding: "13px 28px", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: C, transition: "all 0.2s",
            }}
              onMouseEnter={e => e.target.style.background = t.accentDim}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >Contact Us</button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 48, flexWrap: "wrap" }}>
            {[["3,598+", "Projects Done"], ["98%", "Satisfaction"], ["5+", "Years"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ color: t.accent, fontSize: 24, fontWeight: 900, fontFamily: C }}>{n}</div>
                <div style={{ color: t.textMuted, fontSize: 11, letterSpacing: "0.08em", fontFamily: C }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "min(380px,100%)", borderRadius: 16, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: `0 0 40px ${t.accentGlow}`, position: "relative" }}>
            <img src="home.jpg" alt="Cybersecurity" style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(135deg,rgba(0,0,0,0.5),rgba(0,255,204,0.1))" : "linear-gradient(135deg,rgba(255,255,255,0.2),rgba(0,120,90,0.15))" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, background: "linear-gradient(transparent,rgba(0,0,0,0.8))" }}>
              <div style={{ color: t.accent, fontSize: 12, fontFamily: C }}>● LIVE THREAT MONITORING</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────────
function AboutSection() {
  const { t, dark } = useTheme();
  const C = "'Courier New',monospace";
  return (
    <section id="about" style={{ background: t.bg2, padding: "100px 5%", borderTop: `1px solid ${t.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 60, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 320px" }}>
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
            <img src="hack.jpg" alt="Team" style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: dark ? "linear-gradient(to right,rgba(0,0,0,0.5),rgba(0,255,204,0.06))" : "linear-gradient(to right,rgba(255,255,255,0.2),rgba(0,120,90,0.1))" }} />
          </div>
        </div>
        <div style={{ flex: "1 1 400px" }}>
          <div style={{ color: t.accent, fontFamily: C, fontSize: 11, letterSpacing: "0.15em", marginBottom: 12 }}>ABOUT US</div>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: t.text, fontFamily: C, marginBottom: 20 }}>
            We Defend. You <span style={{ color: t.accent }}>Grow Safely.</span>
          </h2>
          <p style={{ color: t.textSub, lineHeight: 1.8, marginBottom: 16, fontFamily: "Georgia,serif" }}>
            Over 3,598 projects completed. Clients trust us for on-time delivery, confidentiality, and results that matter.
          </p>
          <p style={{ color: t.textSub, lineHeight: 1.8, fontFamily: "Georgia,serif" }}>
            We take a job <span style={{ color: t.accent }}>ONLY if we can deliver it</span> — no guesswork, no delays.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }}>
            {["On-time Delivery", "Certified Experts", "Confidential Reports", "24/7 Support"].map(item => (
              <div key={item} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: t.accent }}>✓</span>
                <span style={{ color: t.textSub, fontSize: 13, fontFamily: C }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES SECTION ─────────────────────────────────────────────────────────
function ServicesSection({ onServiceClick }) {
  const { t } = useTheme();
  const C = "'Courier New',monospace";
  return (
    <section id="services" style={{ background: t.bg, padding: "100px 5%", borderTop: `1px solid ${t.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ color: t.accent, fontFamily: C, fontSize: 11, letterSpacing: "0.15em", marginBottom: 12 }}>WHAT WE DO</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: t.text, fontFamily: C }}>
            Our Cybersecurity <span style={{ color: t.accent }}>Services</span>
          </h2>
          <p style={{ color: t.textMuted, maxWidth: 500, margin: "14px auto 0", fontFamily: "Georgia,serif", fontSize: 15 }}>
            Click any service to see full details, pricing, and book your consultation.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 16 }}>
          {SERVICES.map(svc => <ServiceCard key={svc.id} service={svc} onServiceClick={onServiceClick} />)}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, onServiceClick }) {
  const { t } = useTheme();
  const C = "'Courier New',monospace";
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? t.surfaceHover : t.cardBg,
        border: `1px solid ${hov ? t.borderHover : t.border}`,
        borderRadius: 14, padding: 22, transition: "all 0.3s",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? `0 8px 30px ${t.accentGlow}` : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 30 }}>{service.emoji}</span>
        {service.popular && <span style={{ background: t.accentDim, color: t.accent, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: C }}>POPULAR</span>}
      </div>
      <div style={{ color: t.accent, fontWeight: 700, fontSize: 14, marginBottom: 8, fontFamily: C }}>{service.title}</div>
      <div style={{ color: t.textSub, fontSize: 13, lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{service.shortDesc}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ color: t.textMuted, fontSize: 11, fontFamily: C }}>⏱ {service.duration}</span>
        <span style={{ color: t.textMuted, fontSize: 11, fontFamily: C }}>📁 {service.category}</span>
      </div>
      <button onClick={() => onServiceClick(service)} style={{
        background: hov ? t.accent : "transparent",
        color: hov ? "#fff" : t.accent,
        border: `1px solid ${t.accent}`,
        borderRadius: 8, padding: "10px 14px",
        fontSize: 12, fontWeight: 700, cursor: "pointer",
        fontFamily: C, letterSpacing: "0.06em", transition: "all 0.2s",
      }}>VIEW DETAILS & PLANS →</button>
    </div>
  );
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────
function ContactSection() {
  const { t } = useTheme();
  const C = "'Courier New',monospace";
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const inp = { width: "100%", padding: "12px 14px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text, fontSize: 14, fontFamily: C, boxSizing: "border-box", outline: "none", marginBottom: 12, transition: "border-color 0.2s" };

  const handleSubmit = async e => {
    e.preventDefault(); setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: "New Contact - HackSecure", from_name: "HackSecure", replyto: form.email, ...form }) });
      const d = await res.json();
      setStatus(d.success ? "sent" : "error");
    } catch { setStatus("error"); }
  };

  return (
    <section id="contact" style={{ background: t.bg2, padding: "100px 5%", borderTop: `1px solid ${t.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 60, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 320px" }}>
          <div style={{ color: t.accent, fontFamily: C, fontSize: 11, letterSpacing: "0.15em", marginBottom: 12 }}>GET IN TOUCH</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 900, color: t.text, fontFamily: C, marginBottom: 18 }}>
            Let's Secure <span style={{ color: t.accent }}>Your Systems</span>
          </h2>
          <p style={{ color: t.textSub, lineHeight: 1.7, fontFamily: "Georgia,serif", marginBottom: 28 }}>Reach out confidentially — we respond quickly.</p>
          <button onClick={() => openWA("Hi HackSecure! I need cybersecurity help.")} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.3)",
            borderRadius: 10, padding: "14px 18px", cursor: "pointer", marginBottom: 14, width: "100%",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.08)"}
          >
            <span style={{ fontSize: 22 }}>💬</span>
            <div>
              <div style={{ color: "#25d366", fontWeight: 700, fontSize: 13, fontFamily: C }}>Chat on WhatsApp</div>
              <div style={{ color: t.textMuted, fontSize: 12 }}>Usually responds in minutes</div>
            </div>
          </button>
          <div style={{ background: t.accentDim, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16, color: t.textSub, fontSize: 12, fontFamily: C, lineHeight: 2 }}>
            📧 {ADMIN_EMAIL}<br />⏰ Within 24 hours<br />🔒 100% Confidential
          </div>
        </div>
        <div style={{ flex: "1 1 380px" }}>
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: "30px 26px" }}>
            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                <h3 style={{ color: t.accent, fontFamily: C, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: t.textSub }}>We'll reply within 24 hours.</p>
                <button onClick={() => { setStatus("idle"); setForm({ name: "", email: "", message: "" }); }} style={{ marginTop: 18, padding: "10px 24px", background: t.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontFamily: C }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.15em", marginBottom: 18, fontFamily: C }}>SEND A MESSAGE</div>
                <input name="name" placeholder="Your Name *" required value={form.name} onChange={set("name")} style={inp} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                <input name="email" type="email" placeholder="Your Email *" required value={form.email} onChange={set("email")} style={inp} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                <textarea name="message" placeholder="Your Message *" required value={form.message} onChange={set("message")} style={{ ...inp, height: 110, resize: "none" }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.inputBorder} />
                {status === "error" && <p style={{ color: t.red, fontSize: 12, marginBottom: 10, fontFamily: C }}>Failed. Try WhatsApp instead.</p>}
                <button type="submit" style={{ width: "100%", padding: 13, background: t.accent, color: "#fff", border: "none", borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: C, opacity: status === "sending" ? 0.7 : 1 }}>
                  {status === "sending" ? "SENDING..." : "SEND MESSAGE →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ onLoginClick }) {
  const { t } = useTheme();
  const C = "'Courier New',monospace";
  return (
    <footer style={{ background: t.bg2, borderTop: `1px solid ${t.border}`, padding: "60px 5% 28px", fontFamily: C }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 40, marginBottom: 44 }}>
          <div>
            <span style={{ color: t.accent, fontSize: 17, fontWeight: 900, letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>HackSecure</span>
            <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.7 }}>Professional ethical hacking & cybersecurity since 2019.</p>
          </div>
          <div>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.14em", marginBottom: 14 }}>NAVIGATE</div>
            {["Home", "Services", "About", "Contact"].map(l => (
              <button key={l} onClick={() => l === "Contact" ? openWA("Hi!") : scrollTo(l.toLowerCase())} style={{ display: "block", background: "none", border: "none", color: t.textMuted, fontSize: 13, cursor: "pointer", padding: "3px 0", fontFamily: C, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = t.accent} onMouseLeave={e => e.target.style.color = t.textMuted}
              >→ {l}</button>
            ))}
          </div>
          <div>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.14em", marginBottom: 14 }}>SERVICES</div>
            {["Penetration Testing", "Network Security", "Cloud Security", "Bug Bounty", "Mobile Security"].map(s => (
              <div key={s} style={{ color: t.textMuted, fontSize: 13, padding: "3px 0" }}>→ {s}</div>
            ))}
          </div>
          <div>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.14em", marginBottom: 14 }}>ACCOUNT</div>
            <button onClick={onLoginClick} style={{ display: "block", background: "none", border: "none", color: t.textMuted, fontSize: 13, cursor: "pointer", padding: "3px 0", fontFamily: C }} onMouseEnter={e => e.target.style.color = t.accent} onMouseLeave={e => e.target.style.color = t.textMuted}>→ Sign In / Sign Up</button>
            <div style={{ color: t.textMuted, fontSize: 13, padding: "3px 0" }}>📧 {ADMIN_EMAIL}</div>
            <button onClick={() => openWA("Hi!")} style={{ marginTop: 12, padding: "8px 16px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: 6, color: "#25d366", fontSize: 12, cursor: "pointer", fontFamily: C, fontWeight: 700 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.18)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.08)"}
            >💬 WhatsApp Us</button>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ color: t.textMuted, fontSize: 12 }}>© {new Date().getFullYear()} HackSecure. All rights reserved.</span>
          <span style={{ color: t.textMuted, fontSize: 12 }}>
            Built for <span style={{ color: t.accent }}>ethical</span> professionals ·{" "}
            <button onClick={() => window.location.hash = "#admin"} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 12, cursor: "pointer", fontFamily: C }}>Admin</button>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function MainSite({ onServiceClick, onLoginClick, onProfileClick, onLogout, onLandingClick }) {
  const { t } = useTheme();
  return (
    <div style={{ background: t.bg, minHeight: "100vh" }}>
      <Navbar onLoginClick={onLoginClick} onProfileClick={onProfileClick} onLogout={onLogout} onLandingClick={onLandingClick} />
      <HomeSection onServiceClick={onServiceClick} />
      <AboutSection />
      <ServicesSection onServiceClick={onServiceClick} />
      <ContactSection />
      <Footer onLoginClick={onLoginClick} />
    </div>
  );
}
