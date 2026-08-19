import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { SERVICES } from "../data/services";

const WHATSAPP_NUM = "6285138798883";
const C = "'Courier New', Courier, monospace";
// Configurable Main Site URL for separate domain setup (e.g. "https://app.hacksecure.com")
const MAIN_SITE_URL = (import.meta.env.VITE_MAIN_SITE_URL || "").replace(/\/$/, "");

function openWhatsApp(text = "Hi HackSecure! I want to inquire about cybersecurity freelance services.") {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Contact");
  }
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`, "_blank");
}

export default function LandingPage({ onEnterSite, onServiceSelect, onLoginClick }) {
  const { t, dark, toggle } = useTheme();

  // ── Lead Form & UI State ───────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [leadForm, setLeadForm] = useState({
    name: "",
    whatsapp: "",
    requirement: "",
    email: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Timer reference for the 10s popup
  const popupTimerRef = useRef(null);
  const hasSubmittedBefore = typeof window !== "undefined" && localStorage.getItem("hs_lead_done") === "1";

  // ── 10s Periodic Popup Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (hasSubmittedBefore) return;

    const scheduleNextPopup = (delay = 10000) => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => {
        if (localStorage.getItem("hs_lead_done") !== "1" && !submitted) {
          setModalOpen(true);
        }
      }, delay);
    };

    // First auto-popup after 8 seconds
    scheduleNextPopup(8000);

    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [submitted, hasSubmittedBefore]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError("");
    if (!submitted && localStorage.getItem("hs_lead_done") !== "1") {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => {
        if (localStorage.getItem("hs_lead_done") !== "1" && !submitted) {
          setModalOpen(true);
        }
      }, 10000);
    }
  };

  const handleOpenLeadModal = (service = null) => {
    setMobileMenuOpen(false);
    if (service) {
      setSelectedService(service);
      setLeadForm((prev) => ({
        ...prev,
        requirement: prev.requirement || `Inquiry regarding ${service.title} service.`,
      }));
    }
    setModalOpen(true);
  };

  // ── Handle Service / CTA Click ─────────────────────────────────────────────
  const handleSiteNavigation = (targetService = null) => {
    handleOpenLeadModal(targetService);
  };

  // ── Form Submit ────────────────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!leadForm.name.trim()) return setFormError("Please enter your full name.");
    if (!leadForm.whatsapp.trim()) return setFormError("Please enter your WhatsApp number.");
    if (leadForm.whatsapp.replace(/\D/g, "").length < 7) {
      return setFormError("Please enter a valid WhatsApp number with country code.");
    }
    if (!leadForm.requirement.trim()) return setFormError("Please describe your requirement.");
    if (!agreed) return setFormError("Please accept the terms and conditions to proceed.");

    setSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        name: leadForm.name.trim(),
        whatsapp: leadForm.whatsapp.trim(),
        requirement: leadForm.requirement.trim(),
        email: leadForm.email.trim() || null,
        serviceTitle: selectedService?.title || "General Landing Page Inquiry",
        serviceId: selectedService?.id || null,
        source: "landing-page",
        submittedAt: serverTimestamp(),
        status: "new",
      });

      localStorage.setItem("hs_lead_done", "1");
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: selectedService?.title || "General Landing Page Inquiry",
          currency: "USD"
        });
      }
      setSubmitted(true);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      setSubmitting(false);
    } catch (err) {
      console.error("Error submitting lead:", err);
      setFormError("Connection issue. Please try WhatsApp directly or resubmit.");
      setSubmitting(false);
    }
  };

  const categories = ["All", "Privacy", "Mobile", "Social", "Cloud", "Forensics"];
  const displayedServices = SERVICES.filter((s) =>
    selectedCategory === "All" ? true : s.category === selectedCategory
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: C,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background Matrix Grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating Radial Glow */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, 100vw)",
          height: "min(900px, 100vw)",
          background: `radial-gradient(circle, ${t.accentDim} 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          background: dark ? "rgba(0,0,0,0.9)" : "rgba(240,247,244,0.92)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${t.border}`,
          padding: "0 5%",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg, ${t.accent}, #007755)`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px ${t.accentGlow}`,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, color: "#000", fontWeight: 900 }}>H</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.accent, fontSize: 18, fontWeight: 900, letterSpacing: "0.06em" }}>
              HackSecure
            </span>
            <span
              style={{
                background: t.accentDim,
                border: `1px solid ${t.border}`,
                color: t.accent,
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 20,
                letterSpacing: "0.08em",
              }}
            >
              FREELANCE
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }} className="hs-desktop-nav">
          <a href="#services" style={{ color: t.textSub, textDecoration: "none", fontSize: 13 }}>
            Services
          </a>
          <a href="#about" style={{ color: t.textSub, textDecoration: "none", fontSize: 13 }}>
            About Us
          </a>
          <a href="#refund" style={{ color: t.textSub, textDecoration: "none", fontSize: 13 }}>
            Refund Policy
          </a>
          <a href="#safety" style={{ color: t.textSub, textDecoration: "none", fontSize: 13 }}>
            Safety & Trust
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            style={{
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 13,
              color: t.text,
            }}
            title="Toggle theme"
          >
            {dark ? "🌙" : "☀️"}
          </button>

          {/* Consultation Button */}
          <button
            onClick={() => handleOpenLeadModal()}
            style={{
              background: t.accent,
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: C,
              letterSpacing: "0.06em",
              boxShadow: `0 0 16px ${t.accentGlow}`,
            }}
          >
            🚀 Get Consultation
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={() => openWhatsApp("Hi HackSecure! I want to inquire about cybersecurity freelance services.")}
            style={{
              background: "rgba(37,211,102,0.12)",
              color: "#25d366",
              border: "1px solid rgba(37,211,102,0.35)",
              borderRadius: 8,
              padding: "7px 14px",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: C,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            💬 WhatsApp Us
          </button>
        </div>

        {/* Mobile Header Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hs-mobile-nav">
          <button
            onClick={toggle}
            style={{
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: 12,
              color: t.text,
            }}
          >
            {dark ? "🌙" : "☀️"}
          </button>

          <button
            onClick={() => handleOpenLeadModal()}
            style={{
              background: t.accent,
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "7px 12px",
              fontWeight: 900,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: C,
              boxShadow: `0 0 12px ${t.accentGlow}`,
            }}
          >
            🚀 Consult
          </button>

          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            style={{
              background: t.cardBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 15,
              color: t.accent,
              fontFamily: C,
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            width: "100%",
            zIndex: 99,
            background: dark ? "rgba(4,10,8,0.96)" : "rgba(245,250,248,0.96)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${t.border}`,
            padding: "20px 5% 26px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            animation: "drawerSlide 0.25s ease",
            boxSizing: "border-box",
          }}
        >
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: t.text, textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "8px 0" }}
          >
            📁 Services Showcase
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: t.text, textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "8px 0" }}
          >
            🛡️ About Us &amp; Freelance Work
          </a>
          <a
            href="#refund"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: t.text, textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "8px 0" }}
          >
            ↩️ 5% Advance &amp; Refund Policy
          </a>
          <a
            href="#safety"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: t.text, textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "8px 0" }}
          >
            🔒 Safety &amp; Trust Guarantee
          </a>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <button
              onClick={() => handleOpenLeadModal()}
              style={{
                width: "100%",
                padding: "12px",
                background: t.accent,
                color: "#000",
                border: "none",
                borderRadius: 10,
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: C,
              }}
            >
              🚀 Free Consultation Form
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openWhatsApp("Hi HackSecure! I want to connect on WhatsApp.");
              }}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(37,211,102,0.12)",
                color: "#25d366",
                border: "1px solid rgba(37,211,102,0.4)",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: C,
              }}
            >
              💬 WhatsApp Directly (24/7)
            </button>
            <button
              onClick={() => handleSiteNavigation()}
              style={{
                width: "100%",
                padding: "11px",
                background: "transparent",
                color: t.accent,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: C,
              }}
            >
              🌐 Enter Main Platform Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "clamp(36px, 6vw, 70px) 5% clamp(40px, 6vw, 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 36,
          flexWrap: "wrap",
          maxWidth: 1200,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: "1 1 320px", maxWidth: "100%" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: t.accentDim,
              border: `1px solid ${t.border}`,
              borderRadius: 30,
              padding: "5px 12px",
              marginBottom: 16,
              color: t.accent,
              fontSize: "clamp(9px, 2.5vw, 11px)",
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.accent,
                boxShadow: `0 0 8px ${t.accent}`,
                animation: "pulseDot 1.5s infinite",
              }}
            />
            PROFESSIONAL CYBER SECURITY FREELANCERS
          </div>

          <h1
            style={{
              fontSize: "clamp(1.9rem, 5.5vw, 3.4rem)",
              fontWeight: 900,
              lineHeight: 1.18,
              margin: "0 0 16px 0",
              color: t.text,
            }}
          >
            We Secure &amp; Defend Your{" "}
            <span
              style={{
                color: t.accent,
                textShadow: `0 0 35px ${t.accentGlow}`,
              }}
            >
              Digital World
            </span>
          </h1>

          <div
            style={{
              background: dark ? "rgba(0,255,204,0.03)" : "rgba(0,100,70,0.03)",
              borderLeft: `3px solid ${t.accent}`,
              borderRadius: "0 10px 10px 0",
              padding: "14px 16px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                color: t.textSub,
                fontSize: "clamp(13px, 3vw, 14.5px)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              <strong style={{ color: t.text }}>Hello, Welcome to the Cyber Security World.</strong>
              <br />
              We are working as <span style={{ color: t.accent, fontWeight: 700 }}>freelancers</span>. We are dealing
              in both <span style={{ color: t.accent, fontWeight: 700 }}>ethical</span> as well as{" "}
              <span style={{ color: dark ? "#ffcc00" : "#b8860b", fontWeight: 700 }}>unethical</span> according to
              your requirement. If you want any service, feel free to contact us — our team member will reach out
              within <span style={{ color: t.accent, fontWeight: 700 }}>24 hours</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 30,
            }}
            className="hs-hero-btns"
          >
            <button
              onClick={() => handleOpenLeadModal()}
              style={{
                background: t.accent,
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "13px 24px",
                fontWeight: 900,
                fontSize: 13.5,
                cursor: "pointer",
                fontFamily: C,
                letterSpacing: "0.05em",
                boxShadow: `0 0 24px ${t.accentGlow}`,
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🚀 Get Free Consultation
            </button>

            <button
              onClick={() => openWhatsApp("Hello HackSecure! I want to hire freelance cybersecurity services.")}
              style={{
                background: "rgba(37,211,102,0.12)",
                color: "#25d366",
                border: "1px solid rgba(37,211,102,0.4)",
                borderRadius: 10,
                padding: "13px 20px",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                fontFamily: C,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              💬 WhatsApp (24/7)
            </button>

            <button
              onClick={() => handleSiteNavigation()}
              style={{
                background: "transparent",
                color: t.textSub,
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                padding: "13px 18px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: C,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Explore Site →
            </button>
          </div>

          {/* Stats Badges */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 12,
              paddingTop: 18,
              borderTop: `1px solid ${t.border}`,
            }}
          >
            {[
              { num: "3,598+", label: "PROJECTS DONE" },
              { num: "98%", label: "SATISFACTION" },
              { num: "5+ YRS", label: "EXPERIENCE" },
              { num: "< 24HR", label: "RESPONSE TIME" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ color: t.accent, fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 900 }}>
                  {stat.num}
                </div>
                <div style={{ color: t.textMuted, fontSize: 9.5, letterSpacing: "0.1em", marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Interactive Cyber Visual Card */}
        <div
          style={{
            flex: "1 1 300px",
            maxWidth: "100%",
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 18,
            padding: "clamp(16px, 3vw, 24px)",
            boxShadow: `0 0 40px ${t.accentGlow}`,
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
              animation: "scanLine 3s linear infinite",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em" }}>
              ● LIVE THREAT RADAR
            </span>
            <span
              style={{
                background: "rgba(37,211,102,0.15)",
                color: "#25d366",
                border: "1px solid rgba(37,211,102,0.3)",
                fontSize: 9.5,
                padding: "2px 7px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              ACTIVE
            </span>
          </div>

          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${t.border}`,
              marginBottom: 14,
              position: "relative",
              height: 160,
            }}
          >
            <img
              src="/home.jpg"
              alt="Cybersecurity Radar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)",
                display: "flex",
                alignItems: "flex-end",
                padding: 12,
              }}
            >
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                🛡️ Continuous Monitoring &amp; Account Protection
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Payment Protocol", value: "5% Advance / 95% After Delivery", color: t.accent },
              { label: "Refund Guarantee", value: "100% No-Questions-Asked", color: "#25d366" },
              { label: "Privacy Rating", value: "Strict Discretion & Zero Logs", color: t.accent },
              { label: "Support Coverage", value: "WhatsApp / Direct Lead (24h)", color: t.textSub },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  padding: "7px 10px",
                  background: t.cardBg,
                  borderRadius: 7,
                  border: `1px solid ${t.border}`,
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                <span style={{ color: t.textMuted }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleOpenLeadModal()}
            style={{
              width: "100%",
              marginTop: 14,
              padding: "11px",
              background: t.accentDim,
              border: `1px solid ${t.accent}`,
              borderRadius: 8,
              color: t.accent,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: C,
            }}
          >
            ⚡ Request Immediate Support
          </button>
        </div>
      </section>

      {/* ── TRUST HIGHLIGHTS BAR ────────────────────────────────────────────── */}
      <div
        style={{
          background: dark ? "rgba(0,0,0,0.7)" : "rgba(230,242,238,0.7)",
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          padding: "16px 5%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 14,
          }}
        >
          {[
            { icon: "🔒", title: "100% Data Safe", desc: "Confidential & safe" },
            { icon: "💰", title: "5% Advance Only", desc: "95% after work done" },
            { icon: "↩️", title: "Refund Anytime", desc: "No questions asked" },
            { icon: "⚡", title: "24-Hour Contact", desc: "Direct team member" },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ color: t.text, fontWeight: 700, fontSize: 12 }}>{item.title}</div>
                <div style={{ color: t.textMuted, fontSize: 10.5, marginTop: 1 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES SHOWCASE SECTION ───────────────────────────────────────── */}
      <section
        id="services"
        style={{
          padding: "clamp(50px, 8vw, 80px) 5%",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
            ● COMPREHENSIVE CYBER DEFENSE &amp; RECOVERY
          </span>
          <h2 style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)", fontWeight: 900, margin: "8px 0" }}>
            Our Freelance <span style={{ color: t.accent }}>Services</span>
          </h2>
          <p style={{ color: t.textSub, maxWidth: 600, margin: "0 auto", fontSize: 13.5, lineHeight: 1.6 }}>
            We cover WhatsApp, Instagram, Facebook, Gmail, Media privacy, and custom assignments.
            Tap any service to connect with our team.
          </p>

          {/* Category Filter Pills (touch scrollable) */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              marginTop: 20,
              WebkitOverflowScrolling: "touch",
            }}
            className="hs-category-scroll"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? t.accent : t.cardBg,
                  color: selectedCategory === cat ? "#000" : t.textSub,
                  border: `1px solid ${selectedCategory === cat ? t.accent : t.border}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: C,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 14,
          }}
        >
          {displayedServices.map((svc) => (
            <div
              key={svc.id}
              onClick={() => handleSiteNavigation(svc)}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                padding: "18px",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              {svc.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: t.accentDim,
                    border: `1px solid ${t.border}`,
                    color: t.accent,
                    fontSize: 8.5,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 8,
                  }}
                >
                  POPULAR
                </span>
              )}

              <div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{svc.emoji}</div>
                <h3 style={{ color: t.text, fontSize: 15, fontWeight: 700, margin: "0 0 6px 0" }}>
                  {svc.title}
                </h3>
                <p style={{ color: t.textSub, fontSize: 12.5, lineHeight: 1.55, margin: "0 0 14px 0" }}>
                  {svc.shortDesc}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                  {svc.features?.slice(0, 3).map((feat, idx) => (
                    <div
                      key={idx}
                      style={{ color: t.textMuted, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ color: t.accent }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: `1px solid ${t.border}`,
                }}
              >
                <span style={{ color: t.textMuted, fontSize: 10.5 }}>📁 {svc.category}</span>
                <span style={{ color: t.accent, fontSize: 11.5, fontWeight: 700 }}>Connect →</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <button
            onClick={() => handleSiteNavigation()}
            style={{
              background: t.accentDim,
              border: `1px solid ${t.accent}`,
              color: t.accent,
              borderRadius: 10,
              padding: "12px 24px",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: C,
              maxWidth: "100%",
            }}
          >
            🌐 View All Services on Main Platform →
          </button>
        </div>
      </section>

      {/* ── ABOUT US SECTION ────────────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          padding: "clamp(50px, 8vw, 80px) 5%",
          background: dark ? "rgba(0,0,0,0.6)" : "rgba(235,245,242,0.6)",
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 36,
            flexWrap: "wrap",
          }}
        >
          {/* Left Column: Image with Frame */}
          <div style={{ flex: "1 1 300px", maxWidth: "100%" }}>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: `1px solid ${t.border}`,
                boxShadow: `0 0 35px ${t.accentGlow}`,
                position: "relative",
              }}
            >
              <img
                src="/hack.jpg"
                alt="HackSecure Ethical and Unethical Operations"
                style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.92))",
                  padding: "16px",
                }}
              >
                <div style={{ color: t.accent, fontSize: 11, fontWeight: 700 }}>
                  ● FREELANCE SECURITY SPECIALISTS
                </div>
                <div style={{ color: "#fff", fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>
                  Discreet, Confidential &amp; Results-Driven
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About Content */}
          <div style={{ flex: "1 1 320px", maxWidth: "100%" }}>
            <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
              ● WHO WE ARE &amp; HOW WE OPERATE
            </span>
            <h2 style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)", fontWeight: 900, margin: "8px 0 16px" }}>
              We Defend. You <span style={{ color: t.accent }}>Grow Safely.</span>
            </h2>

            <p style={{ color: t.textSub, fontSize: "clamp(13px, 3vw, 14.5px)", lineHeight: 1.75, marginBottom: 14 }}>
              <strong style={{ color: t.text }}>Hello, Welcome to the Cyber Security World.</strong>
              <br />
              We are working as <span style={{ color: t.accent, fontWeight: 700 }}>freelancers</span>. We are dealing
              in both <span style={{ color: t.accent, fontWeight: 700 }}>ethical</span> as well as{" "}
              <span style={{ color: dark ? "#ffcc00" : "#b8860b", fontWeight: 700 }}>unethical</span> according to
              your requirement.
            </p>

            <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              If you want any service, feel free to contact us — our team member will reach out within{" "}
              <span style={{ color: t.accent, fontWeight: 700 }}>24 hours</span>. Over 3,598 projects delivered with a
              98% client satisfaction rate.
            </p>

            {/* Checkpoints */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {[
                "100% Data & Privacy Safe",
                "5% Advance / 95% After",
                "Full Refund Anytime",
                "24/7 WhatsApp Response",
                "Both Ethical & Unethical",
                "No Questions Asked",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span style={{ color: t.accent, fontWeight: 900 }}>✓</span>
                  <span style={{ color: t.textSub }}>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleOpenLeadModal()}
              style={{
                background: t.accent,
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: C,
                boxShadow: `0 0 16px ${t.accentGlow}`,
              }}
            >
              🚀 Talk With Our Team Now
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "clamp(50px, 8vw, 80px) 5%",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
            ● SIMPLE 4-STEP PROCESS
          </span>
          <h2 style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)", fontWeight: 900, margin: "8px 0" }}>
            How It <span style={{ color: t.accent }}>Works</span>
          </h2>
          <p style={{ color: t.textSub, fontSize: 13.5, maxWidth: 500, margin: "0 auto" }}>
            From form submission to final delivery, we keep everything smooth, safe, and transparent.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              step: "01",
              title: "Fill the Form",
              desc: "Provide your Name, WhatsApp number, and brief requirement.",
              icon: "📝",
            },
            {
              step: "02",
              title: "24hr Connect",
              desc: "Our team member reaches out on WhatsApp within 24 hours.",
              icon: "💬",
            },
            {
              step: "03",
              title: "5% Advance",
              desc: "Pay only 5% deposit to initiate. 95% remains safely with you.",
              icon: "💰",
            },
            {
              step: "04",
              title: "Delivery & 95%",
              desc: "After work is 100% completed & verified, you settle the rest.",
              icon: "🎯",
            },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                padding: "20px 16px",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.accent}, #007755)`,
                  color: "#000",
                  fontWeight: 900,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: `0 0 12px ${t.accentGlow}`,
                }}
              >
                {s.step}
              </div>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <h3 style={{ color: t.text, fontSize: 14.5, fontWeight: 700, margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ color: t.textSub, fontSize: 12, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAFETY, PRIVACY & TRUST SECTION ─────────────────────────────────── */}
      <section
        id="safety"
        style={{
          padding: "clamp(50px, 8vw, 80px) 5%",
          background: dark ? "rgba(0,0,0,0.6)" : "rgba(235,245,242,0.6)",
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
              ● 100% PEACE OF MIND
            </span>
            <h2 style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)", fontWeight: 900, margin: "8px 0" }}>
              Safety &amp; <span style={{ color: t.accent }}>Trust Guarantee</span>
            </h2>
            <p style={{ color: t.textSub, fontSize: 13.5, maxWidth: 540, margin: "0 auto" }}>
              Your security and privacy are our top priorities. Here is our ironclad commitment to you.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                icon: "🔒",
                title: "100% Data Safe & Confidential",
                desc: "We operate with zero-log policies. Your data, identity, conversation history, and target details will never be exposed or shared.",
                tag: "CONFIDENTIALITY",
              },
              {
                icon: "💰",
                title: "5% Advance / 95% Completion",
                desc: "You never bear financial risk. Only 5% is required to start, and the remaining 95% is paid ONLY after successful delivery.",
                tag: "PAYMENT PROTECTION",
              },
              {
                icon: "↩️",
                title: "No-Questions-Asked Refund",
                desc: "If at any point you are not satisfied or change your mind, we provide a 100% refund without any hassle or interrogation.",
                tag: "REFUND GUARANTEE",
              },
              {
                icon: "🤝",
                title: "Both Ethical & Unethical Scope",
                desc: "Whether you need defensive vulnerability audits or personal recovery and investigations, we tailor our capabilities to your exact scenario.",
                tag: "CUSTOM SCOPE",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  padding: "20px",
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{card.icon}</span>
                  <span
                    style={{
                      background: t.accentDim,
                      color: t.accent,
                      fontSize: 8.5,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 8,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3 style={{ color: t.text, fontSize: 14.5, fontWeight: 700, margin: "0 0 8px" }}>{card.title}</h3>
                <p style={{ color: t.textSub, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REFUND & PAYMENT POLICY SECTION ─────────────────────────────────── */}
      <section
        id="refund"
        style={{
          padding: "clamp(50px, 8vw, 80px) 5%",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${dark ? "rgba(0,255,204,0.06)" : "rgba(0,100,70,0.06)"}, ${t.surface})`,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "clamp(20px, 4vw, 36px)",
            boxShadow: `0 0 35px ${t.accentGlow}`,
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: 800 }}>
            <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
              ● OFFICIAL PAYMENT &amp; REFUND POLICY
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.3rem)", fontWeight: 900, margin: "8px 0 14px" }}>
              Your Money &amp; Trust Are <span style={{ color: t.accent }}>100% Safe With Us</span>
            </h2>
            <p style={{ color: t.textSub, fontSize: 13.5, lineHeight: 1.7, marginBottom: 20 }}>
              We know trust is the most critical factor when hiring freelance cybersecurity professionals.
              Here is our transparent policy:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  num: "1",
                  title: "5% Advance / 95% Post-Work Payment",
                  desc: "You only pay 5% of the total quote upfront to book the slot and initialize tools. The remaining 95% is paid strictly after the full assignment is complete and verified.",
                },
                {
                  num: "2",
                  title: "Anytime Refund Without Any Question",
                  desc: "If at any point during or after the service you request a refund, we process it immediately. No arguments, no questions, no hidden deduction fees.",
                },
                {
                  num: "3",
                  title: "Work Undertaken Only If 100% Deliverable",
                  desc: "We perform a free pre-assessment of your requirement. If a target or solution cannot be achieved, we tell you upfront and do not take the assignment.",
                },
                {
                  num: "4",
                  title: "100% Safe Data Guarantee",
                  desc: "All files, credentials, logs, and information provided are permanently purged after delivery upon your confirmation.",
                },
              ].map((policy) => (
                <div
                  key={policy.num}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: t.accentDim,
                      border: `1px solid ${t.border}`,
                      color: t.accent,
                      fontSize: 11,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {policy.num}
                  </div>
                  <div>
                    <div style={{ color: t.text, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                      {policy.title}
                    </div>
                    <div style={{ color: t.textSub, fontSize: 12, lineHeight: 1.55 }}>{policy.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleOpenLeadModal()}
                style={{
                  background: t.accent,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px 20px",
                  fontWeight: 900,
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: C,
                }}
              >
                🚀 Agree &amp; Request Service
              </button>
              <button
                onClick={() => openWhatsApp("Hi! I have a question regarding your 5% advance and refund policy.")}
                style={{
                  background: "transparent",
                  color: "#25d366",
                  border: "1px solid rgba(37,211,102,0.4)",
                  borderRadius: 8,
                  padding: "11px 18px",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  fontFamily: C,
                }}
              >
                💬 Ask on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ───────────────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(40px, 6vw, 70px) 5%",
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${dark ? "rgba(0,255,204,0.08)" : "rgba(0,100,70,0.08)"}, ${t.surface})`,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            padding: "clamp(26px, 5vw, 44px) clamp(16px, 4vw, 28px)",
            textAlign: "center",
            boxShadow: `0 0 45px ${t.accentGlow}`,
            boxSizing: "border-box",
          }}
        >
          <span style={{ color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em" }}>
            ● START SECURING YOUR ASSETS TODAY
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.5rem)", fontWeight: 900, margin: "10px 0" }}>
            Ready to Take <span style={{ color: t.accent }}>Action?</span>
          </h2>
          <p style={{ color: t.textSub, fontSize: 13.5, maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.65 }}>
            Fill the 60-second requirement form or message us directly on WhatsApp. Our freelance team is available
            24/7 with immediate response.
          </p>

          <div
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
            className="hs-cta-btns"
          >
            <button
              onClick={() => handleOpenLeadModal()}
              style={{
                background: t.accent,
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "13px 26px",
                fontWeight: 900,
                fontSize: 13.5,
                cursor: "pointer",
                fontFamily: C,
                boxShadow: `0 0 24px ${t.accentGlow}`,
              }}
            >
              🚀 Submit Requirement
            </button>
            <button
              onClick={() => openWhatsApp("Hi HackSecure! I want to start a cybersecurity project.")}
              style={{
                background: "rgba(37,211,102,0.12)",
                color: "#25d366",
                border: "1px solid rgba(37,211,102,0.4)",
                borderRadius: 10,
                padding: "13px 22px",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                fontFamily: C,
              }}
            >
              💬 WhatsApp Us Directly
            </button>
          </div>

          <div style={{ marginTop: 22, color: t.textMuted, fontSize: 12, fontFamily: C }}>
            🔒 100% Confidential • 💰 5% Advance Only • ⚡ 24hr WhatsApp Response
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: dark ? "#020705" : "#e6f0ec",
          borderTop: `1px solid ${t.border}`,
          padding: "40px 5% 90px",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 24,
            marginBottom: 30,
          }}
        >
          <div>
            <div style={{ color: t.accent, fontSize: 17, fontWeight: 900, marginBottom: 10 }}>
              HackSecure
            </div>
            <p style={{ color: t.textSub, fontSize: 12, lineHeight: 1.65 }}>
              Freelance cybersecurity experts dealing in ethical and unethical operations per client requirement.
            </p>
            <div style={{ marginTop: 10 }}>
              <span style={{ color: t.accent, fontSize: 11.5, fontWeight: 700 }}>WhatsApp: +{WHATSAPP_NUM}</span>
            </div>
          </div>

          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>SERVICES</div>
            {["WhatsApp Security", "Instagram Security", "Facebook Security", "Gmail Assessment", "Camera & Media Privacy"].map(
              (item) => (
                <div
                  key={item}
                  onClick={() => handleSiteNavigation()}
                  style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 6, cursor: "pointer" }}
                >
                  → {item}
                </div>
              )
            )}
          </div>

          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>SAFETY &amp; POLICY</div>
            <div style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 6 }}>✓ 5% Advance Only</div>
            <div style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 6 }}>✓ 95% After Completion</div>
            <div style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 6 }}>✓ 100% Refund Anytime</div>
            <div style={{ color: t.textMuted, fontSize: 11.5, marginBottom: 6 }}>✓ Strict Discretion</div>
          </div>

          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 12.5, marginBottom: 10 }}>QUICK ACCESS</div>
            <button
              onClick={() => handleOpenLeadModal()}
              style={{
                width: "100%",
                padding: "9px",
                background: t.accent,
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 900,
                fontSize: 11.5,
                cursor: "pointer",
                fontFamily: C,
                marginBottom: 8,
              }}
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => handleSiteNavigation()}
              style={{
                width: "100%",
                padding: "8px",
                background: "transparent",
                color: t.accent,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 11.5,
                cursor: "pointer",
                fontFamily: C,
              }}
            >
              Open Web App
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            paddingTop: 16,
            borderTop: `1px solid ${t.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            color: t.textMuted,
            fontSize: 10.5,
          }}
        >
          <div>© {new Date().getFullYear()} HackSecure Freelance Network.</div>
          <div>Strictly Confidential · Zero Logs</div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP BUTTON (MOBILE OPTIMIZED) ──────────────────────── */}
      <div
        onClick={() => openWhatsApp("Hi HackSecure! I want to connect regarding cybersecurity services.")}
        style={{
          position: "fixed",
          bottom: 20,
          right: 18,
          zIndex: 999,
          background: "#25d366",
          color: "#fff",
          borderRadius: 30,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 900,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(37,211,102,0.45)",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: 16 }}>💬</span>
        <span className="hs-wa-text">WhatsApp</span>
      </div>

      {/* ── LEAD CAPTURE POPUP MODAL ────────────────────────────────────────── */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px",
            animation: "modalFadeIn 0.25s ease",
            boxSizing: "border-box",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 18,
              width: "100%",
              maxWidth: 520,
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: `0 0 60px ${t.accentGlow}`,
              boxSizing: "border-box",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${t.border}`,
                borderRadius: "50%",
                width: 30,
                height: 30,
                color: t.textSub,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: C,
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {/* Success State */}
            {submitted ? (
              <div style={{ padding: "36px 20px", textAlign: "center", animation: "popIn 0.35s ease" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                <h3 style={{ color: t.accent, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", fontWeight: 900, marginBottom: 10 }}>
                  Thank You! Request Received
                </h3>
                <p style={{ color: t.text, fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: "0 auto 16px" }}>
                  We have successfully received your requirement details.
                </p>
                <div
                  style={{
                    background: dark ? "rgba(0,255,204,0.06)" : "rgba(0,100,70,0.06)",
                    border: `1px solid ${t.border}`,
                    borderRadius: 12,
                    padding: "16px 18px",
                    maxWidth: 380,
                    margin: "0 auto 22px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
                    💬 OUR TEAM WILL CONNECT WITH YOU
                  </div>
                  <div style={{ color: t.textSub, fontSize: 12.5, lineHeight: 1.6 }}>
                    Our team member will reach out to you on <strong style={{ color: t.text }}>WhatsApp within 24 hours</strong> with complete assistance and details.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => openWhatsApp("Hi HackSecure! I just submitted my requirement on the website.")}
                    style={{
                      background: "#25d366",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "11px 18px",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer",
                      fontFamily: C,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    💬 Chat on WhatsApp
                  </button>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      background: t.accentDim,
                      color: t.accent,
                      border: `1px solid ${t.accent}`,
                      borderRadius: 8,
                      padding: "11px 18px",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer",
                      fontFamily: C,
                    }}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Modal Header */}
                <div
                  style={{
                    background: t.accentDim,
                    borderBottom: `1px solid ${t.border}`,
                    padding: "20px 22px 16px",
                    position: "relative",
                  }}
                >
                  <div style={{ color: t.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 4 }}>
                    ● HACKSECURE — 24HR FREELANCE CONNECT
                  </div>
                  <h3
                    style={{
                      color: t.text,
                      fontSize: "clamp(1.15rem, 4vw, 1.4rem)",
                      fontWeight: 900,
                      lineHeight: 1.25,
                      margin: 0,
                    }}
                  >
                    Hello, Welcome to the<br />
                    <span style={{ color: t.accent }}>Cyber Security World</span> 🌐
                  </h3>
                  <p
                    style={{
                      color: t.textSub,
                      fontSize: 12,
                      lineHeight: 1.55,
                      marginTop: 8,
                      marginBottom: 0,
                    }}
                  >
                    We are working as freelancers, dealing in both <span style={{ color: t.accent }}>ethical</span> as
                    well as <span style={{ color: dark ? "#ffcc00" : "#b8860b" }}>unethical</span> per requirement.
                    Our team reaches out within <strong style={{ color: t.text }}>24 hours</strong>.
                  </p>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleFormSubmit} style={{ padding: "18px 22px 24px" }}>
                  <div style={{ color: t.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 12 }}>
                    REQUIRED DETAILS
                  </div>

                  {/* Name Input */}
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "11px 12px",
                        background: t.inputBg,
                        border: `1px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        color: t.text,
                        fontSize: 16,
                        fontFamily: C,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                      maxLength={80}
                    />
                  </div>

                  {/* WhatsApp Input */}
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="tel"
                      placeholder="WhatsApp Number * (e.g. +91 98765 43210)"
                      value={leadForm.whatsapp}
                      onChange={(e) => setLeadForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "11px 12px",
                        background: t.inputBg,
                        border: `1px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        color: t.text,
                        fontSize: 16,
                        fontFamily: C,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                      maxLength={20}
                    />
                  </div>

                  {/* Requirement Input */}
                  <div style={{ marginBottom: 10 }}>
                    <textarea
                      placeholder="Describe your requirement / task details *"
                      value={leadForm.requirement}
                      onChange={(e) => setLeadForm((p) => ({ ...p, requirement: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "11px 12px",
                        background: t.inputBg,
                        border: `1px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        color: t.text,
                        fontSize: 16,
                        fontFamily: C,
                        boxSizing: "border-box",
                        outline: "none",
                        minHeight: 80,
                        resize: "vertical",
                      }}
                      maxLength={800}
                    />
                  </div>

                  {/* Email Input (Optional) */}
                  <div style={{ marginBottom: 14 }}>
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "11px 12px",
                        background: t.inputBg,
                        border: `1px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        color: t.text,
                        fontSize: 16,
                        fontFamily: C,
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                      maxLength={120}
                    />
                  </div>

                  {/* Terms & Conditions Box */}
                  <div
                    style={{
                      background: dark ? "rgba(0,255,204,0.04)" : "rgba(0,100,70,0.04)",
                      border: `1px solid ${t.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ color: t.accent, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>
                      TERMS &amp; CONDITIONS &amp; SAFETY
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5, color: t.textSub }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span>🔒</span>
                        <span>You and your data is 100% Safe with us.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span>💰</span>
                        <span>Payment service: 5% Advanced and 95% after work complete.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span>↩️</span>
                        <span>Refund Policy: You can get refund anytime without any question.</span>
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginTop: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() => setAgreed((p) => !p)}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          flexShrink: 0,
                          marginTop: 1,
                          border: `2px solid ${agreed ? t.accent : t.inputBorder}`,
                          background: agreed ? t.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {agreed && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span
                        onClick={() => setAgreed((p) => !p)}
                        style={{ color: t.textSub, fontSize: 11.5, lineHeight: 1.45 }}
                      >
                        I agree to terms, conditions, and refund policy.
                      </span>
                    </label>
                  </div>

                  {/* Error Alert */}
                  {formError && (
                    <div
                      style={{
                        background: "rgba(255,60,60,0.1)",
                        border: "1px solid rgba(255,60,60,0.3)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        color: t.red,
                        fontSize: 12,
                        marginBottom: 12,
                      }}
                    >
                      ⚠ {formError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: submitting ? `${t.accent}88` : t.accent,
                      color: "#000",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: C,
                      letterSpacing: "0.05em",
                      boxShadow: submitting ? "none" : `0 0 20px ${t.accentGlow}`,
                    }}
                  >
                    {submitting ? "SUBMITTING LEAD..." : "🚀 SUBMIT & CONNECT WITH TEAM"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Responsive CSS */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to { width: 100%; }
        }

        .hs-mobile-nav {
          display: none !important;
        }
        .hs-desktop-nav {
          display: flex !important;
        }

        @media (max-width: 820px) {
          .hs-desktop-nav {
            display: none !important;
          }
          .hs-mobile-nav {
            display: flex !important;
          }
          .hs-hero-btns button, .hs-cta-btns button {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .hs-wa-text {
            display: none;
          }
        }

        .hs-category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
