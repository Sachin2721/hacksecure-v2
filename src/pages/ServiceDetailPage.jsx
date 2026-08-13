import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function ServiceDetailPage({ service, onSelectPlan, onBack }) {
  const { t, dark } = useTheme();
  const C = "'Courier New', Courier, monospace";
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "What's Included" },
    { id: "deliverables", label: "Deliverables" },
    { id: "faq", label: "FAQ" },
  ];

  const faqs = [
    { q: "How long does the engagement take?", a: `Typical delivery is ${service.duration}. Complex projects may take longer.` },
    { q: "Is my data kept confidential?", a: "Absolutely. All engagements are covered by our strict NDA and confidentiality policy. No data is shared with third parties." },
    { q: "Do I need to provide access to my systems?", a: "Depending on the scope, we may need read-only credentials. We'll discuss exactly what's needed before starting." },
    { q: "What if I find vulnerabilities after the engagement?", a: "Elite plan includes 3 re-tests. Pro includes 1. Basic clients can purchase re-tests separately." },
    { q: "Can I upgrade my plan after purchase?", a: "Yes! Contact us via WhatsApp and we'll arrange an upgrade for the difference in price." },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, fontFamily: C, color: t.text,
    }}>
      {/* Hero */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, #000 0%, #060e0c 100%)"
          : "linear-gradient(135deg, #e8f0ed 0%, #d0e8df 100%)",
        borderBottom: `1px solid ${t.border}`,
        padding: "80px 5% 48px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
          backgroundSize: "50px 50px",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          <button onClick={onBack} style={{
            background: "none", border: `1px solid ${t.border}`,
            color: t.textSub, cursor: "pointer", padding: "7px 14px",
            borderRadius: 8, fontFamily: C, fontSize: 12, marginBottom: 28,
          }}>← Back to Services</button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16, flexShrink: 0,
              background: t.accentDim, border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
            }}>{service.emoji}</div>
            <div style={{ flex: 1 }}>
              {service.popular && (
                <div style={{
                  display: "inline-block",
                  background: t.accentDim, border: `1px solid ${t.border}`,
                  borderRadius: 4, padding: "3px 10px", marginBottom: 10,
                  color: t.accent, fontSize: 10, letterSpacing: "0.12em",
                }}>⭐ MOST REQUESTED</div>
              )}
              <h1 style={{
                fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900,
                color: t.text, marginBottom: 10, lineHeight: 1.2,
              }}>{service.title}</h1>
              <p style={{ color: t.textSub, fontSize: 16, lineHeight: 1.7, maxWidth: 600 }}>
                {service.longDesc}
              </p>
              <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: t.accent }}>⏱</span>
                  <span style={{ color: t.textSub, fontSize: 13 }}>{service.duration}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: t.accent }}>📁</span>
                  <span style={{ color: t.textSub, fontSize: 13 }}>{service.category}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: t.accent }}>🔒</span>
                  <span style={{ color: t.textSub, fontSize: 13 }}>100% Confidential</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 5%", display: "flex", gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "16px 18px", border: "none", background: "none",
              color: activeTab === tab.id ? t.accent : t.textMuted,
              borderBottom: `2px solid ${activeTab === tab.id ? t.accent : "transparent"}`,
              fontFamily: C, fontSize: 13, cursor: "pointer",
              fontWeight: activeTab === tab.id ? 700 : 400,
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 5%" }}>

        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 40,
            }}>
              {[
                { icon: "🎯", label: "Scope", value: service.category + " Security" },
                { icon: "⏱", label: "Duration", value: service.duration },
                { icon: "📋", label: "Deliverables", value: service.deliverables.length + " Documents" },
                { icon: "🔄", label: "Re-tests", value: "Included in Pro/Elite" },
              ].map(item => (
                <div key={item.label} style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ color: t.textMuted, fontSize: 11, letterSpacing: "0.1em", marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                  <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{
              background: t.accentDim, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: 24, marginBottom: 32,
            }}>
              <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.12em", marginBottom: 12 }}>HOW IT WORKS</div>
              <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
                {["Kickoff Call", "Information Gathering", "Testing Phase", "Report Writing", "Delivery & Debrief"].map((step, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, marginRight: 16 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: t.accent, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900, flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ color: t.textSub, fontSize: 13 }}>{step}</span>
                    {i < 4 && <span style={{ color: t.textMuted, fontSize: 16 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        {activeTab === "features" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {service.features.map((f, i) => (
              <div key={i} style={{
                background: t.cardBg, border: `1px solid ${t.border}`,
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: t.accentDim, border: `1px solid ${t.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.accent, fontSize: 14,
                }}>✓</div>
                <span style={{ color: t.text, fontSize: 14, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Deliverables */}
        {activeTab === "deliverables" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {service.deliverables.map((d, i) => (
              <div key={i} style={{
                background: t.cardBg, border: `1px solid ${t.border}`,
                borderRadius: 12, padding: "18px 22px",
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: t.accentDim,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>📄</div>
                <div>
                  <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>{d}</div>
                  <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>Delivered as PDF + Digital Copy</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} t={t} C={C} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: 48, background: t.accentDim,
          border: `1px solid ${t.border}`, borderRadius: 16,
          padding: "32px 28px", textAlign: "center",
        }}>
          <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.15em", marginBottom: 8 }}>READY TO START?</div>
          <h2 style={{ color: t.text, fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            Choose Your Plan
          </h2>
          <p style={{ color: t.textSub, fontSize: 14, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Select from Basic, Professional, or Elite — all include a full report and confidential handling.
          </p>
          <button onClick={onSelectPlan} style={{
            background: t.accent, color: "#fff",
            border: "none", borderRadius: 10, padding: "14px 36px",
            fontWeight: 900, fontSize: 15, cursor: "pointer",
            fontFamily: C, letterSpacing: "0.06em",
            boxShadow: `0 0 24px ${t.accentGlow}`,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 0 36px ${t.accentGlow}`; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = `0 0 24px ${t.accentGlow}`; }}
          >
            VIEW MEMBERSHIP PLANS →
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ faq, t, C }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${open ? t.accent : t.border}`,
      borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "16px 20px",
        background: "none", border: "none", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        textAlign: "left",
      }}>
        <span style={{ color: t.text, fontWeight: 700, fontSize: 14, fontFamily: C }}>{faq.q}</span>
        <span style={{ color: t.accent, fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px" }}>
          <p style={{ color: t.textSub, fontSize: 14, lineHeight: 1.7 }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}
