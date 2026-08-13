import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import { getPlans } from "../data/services";

const WHATSAPP_NUMBER = "919999999999"; // Replace

export default function MembershipModal({ service, user, profile, onClose }) {
  const { t, dark } = useTheme();
  const C = "'Courier New', Courier, monospace";
  const [step, setStep] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [txnId, setTxnId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminQR, setAdminQR] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const plans = getPlans(service);

  // Load QR from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "qr"), (snap) => {
      setAdminQR(snap.exists() ? snap.data().url : null);
    });
    return unsub;
  }, []);

  const handleSubmitPayment = async () => {
    if (!txnId.trim()) return setError("Please enter your Transaction / UTR ID.");
    setError("");
    setSubmitting(true);
    try {
      const order = {
        userId: user.uid,
        userName: profile?.name || user.displayName || "Unknown",
        userEmail: user.email,
        serviceId: service.id,
        service: service.title,
        serviceEmoji: service.emoji,
        plan: selectedPlan.name,
        planId: selectedPlan.id,
        price: selectedPlan.price,
        txnId: txnId.trim(),
        status: "pending",
        statusImage: null,
        adminNote: "",
        placedAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "orders"), order);
      setOrderId(ref.id);

      // Notify admin via WhatsApp
      const msg = `🔐 *New Order - HackSecure*\n\n*Order ID:* ${ref.id}\n*Service:* ${service.title}\n*Plan:* ${selectedPlan.name} — ₹${selectedPlan.price.toLocaleString()}\n*Client:* ${order.userName}\n*Email:* ${order.userEmail}\n*UTR:* ${txnId.trim()}\n\nPlease verify and approve in admin panel.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

      setStep("confirm");
    } catch (err) {
      setError("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, fontFamily: C,
  };

  const box = {
    background: t.bg2,
    border: `1px solid ${t.border}`,
    borderRadius: 18,
    width: "100%",
    maxWidth: step === "plans" ? 880 : 460,
    maxHeight: "92vh", overflowY: "auto",
    padding: "30px 26px",
    boxShadow: `0 0 80px ${t.accentGlow}`,
    position: "relative",
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "none", border: `1px solid ${t.border}`,
          color: t.textMuted, width: 32, height: 32, borderRadius: 8,
          cursor: "pointer", fontSize: 16, fontFamily: C,
        }}>✕</button>

        {/* PLANS STEP */}
        {step === "plans" && (
          <>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.14em", marginBottom: 4 }}>SELECT PLAN</div>
            <h2 style={{ color: t.text, fontSize: 20, marginBottom: 4, fontWeight: 900 }}>
              {service.emoji} {service.title}
            </h2>
            <p style={{ color: t.textSub, fontSize: 13, marginBottom: 24 }}>
              All plans include a confidential report. Upgrade anytime.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              {plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} selected={selectedPlan?.id === plan.id}
                  onSelect={setSelectedPlan} t={t} dark={dark} C={C} />
              ))}
            </div>

            {error && <div style={{ color: t.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}

            <button onClick={() => { if (!selectedPlan) return setError("Please select a plan."); setError(""); setStep("payment"); }}
              style={{
                width: "100%", padding: 14,
                background: selectedPlan ? t.accent : t.bg3,
                color: selectedPlan ? "#fff" : t.textMuted,
                border: "none", borderRadius: 10,
                fontWeight: 900, fontSize: 14, cursor: selectedPlan ? "pointer" : "not-allowed",
                fontFamily: C, letterSpacing: "0.06em", transition: "all 0.2s",
              }}>
              {selectedPlan ? `PROCEED — ₹${selectedPlan.price.toLocaleString()} →` : "SELECT A PLAN TO CONTINUE"}
            </button>
          </>
        )}

        {/* PAYMENT STEP */}
        {step === "payment" && (
          <>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.14em", marginBottom: 4 }}>COMPLETE PAYMENT</div>
            <h2 style={{ color: t.text, fontSize: 20, marginBottom: 16, fontWeight: 900 }}>Scan & Pay</h2>

            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              background: t.bg3, border: `1px solid ${t.border}`,
              borderRadius: 10, padding: "12px 16px", marginBottom: 22,
            }}>
              <span style={{ fontSize: 22 }}>{service.emoji}</span>
              <div>
                <div style={{ color: t.text, fontSize: 14, fontWeight: 700 }}>{selectedPlan.name} — {service.title}</div>
                
              </div>
            </div>

            <div style={{
              textAlign: "center", marginBottom: 20,
              background: t.bg3, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: 24,
            }}>
              {adminQR ? (
                <>
                  <img src={adminQR} alt="QR" style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8, background: "#fff", padding: 8 }} />
                  <div style={{ color: t.textMuted, fontSize: 12, marginTop: 10 }}>Scan with PhonePe, GPay, Paytm, etc.</div>
                </>
              ) : (
                <div style={{ padding: "32px 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                  <div style={{ color: t.textMuted, fontSize: 13 }}>QR not configured. Contact us on WhatsApp.</div>
                </div>
              )}
            </div>

            <div style={{ color: t.textSub, fontSize: 13, marginBottom: 6 }}>Enter Transaction / UTR ID:</div>
            <input
              type="text" placeholder="12-digit UTR number"
              value={txnId} onChange={e => setTxnId(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px",
                background: t.inputBg, border: `1px solid ${txnId ? t.accent : t.inputBorder}`,
                borderRadius: 8, color: t.text, fontSize: 14,
                fontFamily: C, boxSizing: "border-box", outline: "none", marginBottom: 6,
              }}
            />
            <div style={{ color: t.textMuted, fontSize: 11, marginBottom: 18 }}>
              💡 Find UTR in your UPI app under "Payment Successful"
            </div>

            {error && <div style={{ color: t.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}

            <button onClick={handleSubmitPayment} disabled={submitting} style={{
              width: "100%", padding: 14, background: t.accent, color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 900, fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer", fontFamily: C,
              opacity: submitting ? 0.7 : 1,
              boxShadow: `0 0 20px ${t.accentGlow}`,
            }}>
              {submitting ? "SUBMITTING..." : "SUBMIT & NOTIFY ADMIN →"}
            </button>
            <button onClick={() => setStep("plans")} style={{
              width: "100%", marginTop: 10, padding: 10,
              background: "transparent", border: `1px solid ${t.border}`,
              borderRadius: 8, color: t.textMuted, cursor: "pointer", fontFamily: C, fontSize: 12,
            }}>← Back to Plans</button>
          </>
        )}

        {/* CONFIRM STEP */}
        {step === "confirm" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.15em", marginBottom: 6 }}>ORDER PLACED</div>
            <h2 style={{ color: t.text, fontSize: 22, marginBottom: 10 }}>Request Submitted!</h2>
            <p style={{ color: t.textSub, fontSize: 14, lineHeight: 1.7, marginBottom: 22 }}>
              Our team has been notified via WhatsApp. Your payment will be verified and order approved within <span style={{ color: t.accent }}>2–6 hours</span>.
            </p>
            <div style={{
              background: t.bg3, border: `1px solid ${t.border}`,
              borderRadius: 10, padding: 16, marginBottom: 22, textAlign: "left",
            }}>
              {[["Order ID", orderId || "Generated"], ["Service", service.title], ["Plan", selectedPlan.name], ["Amount", `₹${selectedPlan.price.toLocaleString()}`], ["Status", "⏳ Pending Approval"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: t.textMuted, fontSize: 13 }}>{k}</span>
                  <span style={{ color: k === "Status" ? t.yellow : t.text, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{
              padding: "12px 32px", background: t.accent, color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 900, cursor: "pointer", fontFamily: C,
            }}>VIEW MY ORDERS →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, selected, onSelect, t, dark, C }) {
  const color = dark ? plan.colorDark : plan.colorLight;
  return (
    <div onClick={() => onSelect(plan)} style={{
      flex: "1 1 200px",
      background: selected ? (dark ? "rgba(0,255,204,0.06)" : "rgba(0,120,90,0.06)") : t.bg3,
      border: `2px solid ${selected ? color : t.border}`,
      borderRadius: 14, padding: "20px 16px",
      cursor: "pointer", position: "relative",
      transition: "all 0.25s",
      transform: selected ? "scale(1.02)" : "scale(1)",
      boxShadow: selected ? `0 0 24px ${color}33` : "none",
    }}>
      {plan.badge === "POPULAR" && (
        <div style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          background: color, color: dark ? "#000" : "#fff", fontSize: 10,
          fontWeight: 900, fontFamily: C, letterSpacing: "0.1em",
          padding: "3px 12px", borderRadius: 20,
        }}>⭐ MOST POPULAR</div>
      )}
      <div style={{ color: t.textMuted, fontSize: 10, letterSpacing: "0.15em", marginBottom: 4, fontFamily: C }}>{plan.badge}</div>
      <div style={{ color: t.text, fontSize: 17, fontWeight: 900, fontFamily: C, marginBottom: 4 }}>{plan.name}</div>
      <div style={{ marginBottom: 14 }}>
        <span style={{ color, fontSize: 26, fontWeight: 900, fontFamily: C }}>₹{plan.price.toLocaleString()}</span>
        <span style={{ color: t.textMuted, fontSize: 12 }}> /project</span>
      </div>
      {plan.features.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
          <span style={{ color, fontSize: 11, marginTop: 1 }}>✓</span>
          <span style={{ color: t.textSub, fontSize: 12, fontFamily: C, lineHeight: 1.4 }}>{f}</span>
        </div>
      ))}
      {selected && <div style={{ marginTop: 12, color, fontSize: 11, fontFamily: C, textAlign: "center" }}>● SELECTED</div>}
    </div>
  );
}
