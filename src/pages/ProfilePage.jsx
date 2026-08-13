import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SERVICES } from "../data/services";
import ServiceDetailPage from "./ServiceDetailPage";
import MembershipModal from "../components/MembershipModal";

const WHATSAPP = "6285138798883";

function StatusBadge({ status, t }) {
  const map = {
    pending: { color: t.yellow, label: "⏳ Pending" },
    approved: { color: t.accent, label: "✅ Approved" },
    rejected: { color: t.red, label: "❌ Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      color: s.color, fontSize: 12,
      background: s.color + "18", border: `1px solid ${s.color}40`,
      borderRadius: 20, padding: "3px 10px",
      fontFamily: "'Courier New',monospace",
    }}>{s.label}</span>
  );
}

function OrderCard({ order, t }) {
  const C = "'Courier New',monospace";
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.border}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ color: t.text, fontWeight: 700, fontFamily: C, fontSize: 15, marginBottom: 4 }}>
            {order.serviceEmoji} {order.service}
          </div>
          <div style={{ color: t.textSub, fontSize: 12, fontFamily: C }}>
            {order.plan} Plan · ₹{order.price?.toLocaleString()} · {order.placedAt?.toDate ? order.placedAt.toDate().toLocaleDateString("en-IN") : "—"}
          </div>
          <div style={{ color: t.textMuted, fontSize: 11, fontFamily: C, marginTop: 2 }}>
            Order: {order.id?.slice(0, 12)}... · UTR: {order.txnId}
          </div>
        </div>
        <StatusBadge status={order.status} t={t} />
      </div>

      {order.adminNote && (
        <div style={{
          marginTop: 12, background: t.bg3, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "10px 14px",
          color: t.textSub, fontSize: 13,
        }}>
          💬 <strong style={{ color: t.text }}>Admin Note:</strong> {order.adminNote}
        </div>
      )}

      {order.statusImage && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: t.textMuted, fontSize: 11, fontFamily: C, marginBottom: 8 }}>
            {order.status === "approved" ? "✅ Approval Confirmation:" : "❌ Rejection Notice:"}
          </div>
          <img src={order.statusImage} alt="Status" style={{
            maxWidth: 280, width: "100%", borderRadius: 8,
            border: `1px solid ${order.status === "approved" ? t.accent + "50" : t.red + "50"}`,
          }} />
        </div>
      )}
    </div>
  );
}

export default function ProfilePage({ pendingService, clearPendingService, onBack }) {
  const { user, profile, logout } = useAuth();
  const { t, dark, toggle } = useTheme();
  const C = "'Courier New',monospace";

  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (pendingService) {
      setSelectedService(pendingService);
      setShowDetail(true);
      setTab("services");
    }
  }, [pendingService]);

  const handleServiceClick = (svc) => {
    setSelectedService(svc);
    setShowDetail(true);
  };

  const handleShowPlans = () => {
    setShowDetail(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedService(null);
    clearPendingService?.();
    setTab("orders");
  };

  // Service detail full page
  if (showDetail && selectedService) {
    return (
      <ServiceDetailPage
        service={selectedService}
        onSelectPlan={handleShowPlans}
        onBack={() => { setShowDetail(false); setSelectedService(null); clearPendingService?.(); }}
      />
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
    { id: "orders", label: `My Orders (${orders.length})` },
    { id: "account", label: "Account" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: C, color: t.text }}>
      {showModal && selectedService && (
        <MembershipModal service={selectedService} user={user} profile={profile} onClose={handleModalClose} />
      )}

      {/* Topbar */}
      <div style={{
        background: t.navBg, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${t.border}`,
        padding: "0 5%", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{
            background: "none", border: `1px solid ${t.border}`,
            color: t.textMuted, cursor: "pointer", padding: "6px 12px",
            borderRadius: 6, fontFamily: C, fontSize: 12,
          }}>← Site</button>
          <span style={{ color: t.accent, fontWeight: 900, fontSize: 16, letterSpacing: "0.08em" }}>HackSecure</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggle} style={{
            background: t.bg3, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "6px 12px",
            color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 12,
          }}>{dark ? "☀️" : "🌙"}</button>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg,${t.accent},${dark ? "#007755" : "#004d3a"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
          }}>{profile?.avatar || "U"}</div>
          <button onClick={logout} style={{
            background: "none", border: `1px solid ${t.border}`,
            color: t.textMuted, cursor: "pointer", padding: "6px 12px",
            borderRadius: 6, fontFamily: C, fontSize: 12,
          }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 5%" }}>
        {/* Profile header */}
        <div style={{
          background: t.accentDim, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: "24px 26px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg,${t.accent},${dark ? "#007755" : "#004d3a"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "#fff",
          }}>{profile?.avatar || "U"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{profile?.name || user?.displayName || "User"}</div>
            <div style={{ color: t.textSub, fontSize: 13 }}>{user?.email}</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Orders", orders.length, t.text], ["Approved", orders.filter(o => o.status === "approved").length, t.accent], ["Pending", orders.filter(o => o.status === "pending").length, t.yellow]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ color: c, fontSize: 22, fontWeight: 900 }}>{v}</div>
                <div style={{ color: t.textMuted, fontSize: 10 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: t.bg3,
          border: `1px solid ${t.border}`, borderRadius: 10,
          padding: 4, marginBottom: 26, width: "fit-content", flexWrap: "wrap",
        }}>
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              padding: "8px 18px", border: "none", borderRadius: 8,
              background: tab === tb.id ? t.accent : "transparent",
              color: tab === tb.id ? "#fff" : t.textMuted,
              fontWeight: tab === tb.id ? 900 : 400,
              fontSize: 13, fontFamily: C, cursor: "pointer", transition: "all 0.2s",
            }}>{tb.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {[
                { icon: "🛡️", title: "Browse Services", desc: "10 services available", action: () => setTab("services") },
                { icon: "📋", title: "My Orders", desc: `${orders.length} order${orders.length !== 1 ? "s" : ""} total`, action: () => setTab("orders") },
                { icon: "💬", title: "WhatsApp Support", desc: "Instant team help", action: () => window.open(`https://wa.me/${WHATSAPP}?text=Hi, I need help.`, "_blank") },
                { icon: "⚙️", title: "Account Settings", desc: "Profile & preferences", action: () => setTab("account") },
              ].map(item => (
                <button key={item.title} onClick={item.action} style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: 20, cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.background = t.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.cardBg; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ color: t.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: t.textMuted, fontSize: 12 }}>{item.desc}</div>
                </button>
              ))}
            </div>
            {orders.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.12em", marginBottom: 14 }}>RECENT ORDERS</div>
                {[...orders].sort((a, b) => (b.placedAt?.seconds || 0) - (a.placedAt?.seconds || 0)).slice(0, 3).map(o => <OrderCard key={o.id} order={o} t={t} />)}
              </div>
            )}
          </div>
        )}

        {/* Services */}
        {tab === "services" && (
          <div>
            <div style={{ color: t.textMuted, fontSize: 13, marginBottom: 20 }}>
              Click any service to see full details, then choose a plan.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
              {SERVICES.map(svc => (
                <div key={svc.id} onClick={() => handleServiceClick(svc)} style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${t.accentGlow}`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{svc.emoji}</span>
                    {svc.popular && <span style={{ background: t.accentDim, color: t.accent, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: C }}>POPULAR</span>}
                  </div>
                  <div style={{ color: t.accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{svc.title}</div>
                  <div style={{ color: t.textSub, fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{svc.shortDesc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: t.textMuted, fontSize: 11 }}>⏱ {svc.duration}</span>
                    <span style={{ color: t.accent, fontSize: 12 }}>Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", border: `1px dashed ${t.border}`, borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 16 }}>No orders yet.</div>
                <button onClick={() => setTab("services")} style={{
                  padding: "10px 24px", background: t.accent, color: "#fff",
                  border: "none", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontFamily: C,
                }}>Browse Services</button>
              </div>
            ) : (
              [...orders].sort((a, b) => (b.placedAt?.seconds || 0) - (a.placedAt?.seconds || 0)).map(o => <OrderCard key={o.id} order={o} t={t} />)
            )}
          </div>
        )}

        {/* Account */}
        {tab === "account" && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "24px 22px", marginBottom: 16 }}>
              <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.12em", marginBottom: 16 }}>PROFILE INFO</div>
              {[["Name", profile?.name || user?.displayName], ["Email", user?.email], ["Member Since", user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ color: t.textMuted, fontSize: 13 }}>{k}</span>
                  <span style={{ color: t.text, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} style={{
              width: "100%", padding: 13,
              background: "transparent", border: `1px solid ${t.red}50`,
              borderRadius: 10, color: t.red, cursor: "pointer",
              fontFamily: C, fontSize: 14, fontWeight: 700,
            }}>🚪 Sign Out</button>
          </div>
        )}
      </div>
    </div>
  );
}
