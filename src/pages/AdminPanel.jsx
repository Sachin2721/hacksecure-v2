import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection, onSnapshot, doc, updateDoc,
  setDoc, deleteDoc, query, orderBy, getDoc,
} from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";

const WHATSAPP_ADMIN = "6285138798883";
const ADMIN_PASSWORD = "hacksecure@admin"; // Change this
const C = "'Courier New', Courier, monospace";

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
function Badge({ status, t }) {
  const map = {
    pending: { color: t.yellow, label: "⏳ Pending" },
    approved: { color: t.accent, label: "✅ Approved" },
    rejected: { color: t.red, label: "❌ Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      color: s.color, fontSize: 11, fontFamily: C,
      background: s.color + "18", border: `1px solid ${s.color}40`,
      borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, t }) {
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.border}`,
      borderRadius: 14, padding: "20px 22px", flex: "1 1 160px",
    }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: color || t.accent, fontSize: 28, fontWeight: 900, fontFamily: C }}>{value}</div>
      <div style={{ color: t.text, fontSize: 13, fontWeight: 700, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── ORDER ROW ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onUpdate, t }) {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState(order.adminNote || "");
  const [savingNote, setSavingNote] = useState(false);

  const handleImageUpload = (e, newStatus) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await onUpdate(order.id, { status: newStatus, statusImage: reader.result });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    await onUpdate(order.id, { adminNote: note });
    setSavingNote(false);
  };

  const statusColor = { pending: t.yellow, approved: t.accent, rejected: t.red }[order.status] || t.yellow;
  const date = order.placedAt?.toDate ? order.placedAt.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${expanded ? t.accent : t.border}`,
      borderRadius: 14, marginBottom: 10, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        padding: "14px 18px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
        borderLeft: `3px solid ${statusColor}`,
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg,${t.accent},${t.bg3})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
          }}>
            {order.userName?.slice(0, 2).toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{order.userName}</div>
            <div style={{ color: t.textMuted, fontSize: 11 }}>{order.userEmail}</div>
          </div>
          <div style={{ padding: "0 10px", borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>
            <div style={{ color: t.accent, fontSize: 12, fontFamily: C }}>{order.serviceEmoji} {order.service}</div>
            <div style={{ color: t.textMuted, fontSize: 11 }}>{order.plan} · ₹{order.price?.toLocaleString()}</div>
          </div>
          <div style={{ color: t.textMuted, fontSize: 11 }}>{date}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Badge status={order.status} t={t} />
          <span style={{ color: t.textMuted, fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: "0 18px 20px", borderTop: `1px solid ${t.border}` }}>
          {/* Details grid */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", padding: "16px 0 20px" }}>
            {[["Order ID", order.id], ["Transaction UTR", order.txnId], ["Service", order.service], ["Plan", order.plan], ["Amount", `₹${order.price?.toLocaleString()}`], ["Placed", date]].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: t.textMuted, fontSize: 10, letterSpacing: "0.1em", marginBottom: 2 }}>{k.toUpperCase()}</div>
                <div style={{ color: t.text, fontSize: 13, maxWidth: 200, wordBreak: "break-all" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Status image preview */}
          {order.statusImage && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: t.textMuted, fontSize: 10, letterSpacing: "0.1em", marginBottom: 8 }}>CURRENT STATUS IMAGE</div>
              <img src={order.statusImage} alt="Status" style={{
                maxWidth: 220, borderRadius: 8,
                border: `1px solid ${order.status === "approved" ? t.accent + "50" : t.red + "50"}`,
              }} />
            </div>
          )}

          {/* Admin note */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: t.textMuted, fontSize: 10, letterSpacing: "0.1em", marginBottom: 6 }}>ADMIN NOTE (visible to user)</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Payment verified. Work starts Monday."
                style={{
                  flex: 1, padding: "9px 12px",
                  background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                  borderRadius: 8, color: t.text, fontSize: 13,
                  fontFamily: C, outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.inputBorder}
              />
              <button onClick={handleSaveNote} style={{
                padding: "9px 18px", background: t.accentDim,
                border: `1px solid ${t.border}`, borderRadius: 8,
                color: t.accent, cursor: "pointer", fontFamily: C, fontSize: 12,
                fontWeight: 700,
              }}>{savingNote ? "..." : "Save"}</button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,200,150,0.1)", border: `1px solid ${t.accent}60`,
              borderRadius: 8, padding: "9px 16px", cursor: "pointer",
              color: t.accent, fontSize: 12, fontFamily: C, fontWeight: 700,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,200,150,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,200,150,0.1)"}
            >
              {uploading ? "⏳" : "✅"} APPROVE + IMAGE
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, "approved")} />
            </label>

            <label style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `rgba(200,50,50,0.1)`, border: `1px solid ${t.red}60`,
              borderRadius: 8, padding: "9px 16px", cursor: "pointer",
              color: t.red, fontSize: 12, fontFamily: C, fontWeight: 700,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(200,50,50,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(200,50,50,0.1)"}
            >
              {uploading ? "⏳" : "❌"} REJECT + IMAGE
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, "rejected")} />
            </label>

            <button onClick={() => onUpdate(order.id, { status: "approved", statusImage: null })} style={{
              padding: "9px 14px", background: "transparent",
              border: `1px solid ${t.accent}40`, borderRadius: 8,
              color: t.accent, cursor: "pointer", fontFamily: C, fontSize: 12,
            }}>✅ Approve Only</button>

            <button onClick={() => onUpdate(order.id, { status: "rejected", statusImage: null })} style={{
              padding: "9px 14px", background: "transparent",
              border: `1px solid ${t.red}40`, borderRadius: 8,
              color: t.red, cursor: "pointer", fontFamily: C, fontSize: 12,
            }}>❌ Reject Only</button>

            {order.status !== "pending" && (
              <button onClick={() => onUpdate(order.id, { status: "pending" })} style={{
                padding: "9px 14px", background: "transparent",
                border: `1px solid ${t.yellow}40`, borderRadius: 8,
                color: t.yellow, cursor: "pointer", fontFamily: C, fontSize: 12,
              }}>⏳ Reset Pending</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LEAD ROW ──────────────────────────────────────────────────────────────────
function LeadRow({ lead, onUpdate, t, dark }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusMap = {
    new:       { color: t.accent,  label: "🆕 New",       next: "contacted" },
    contacted: { color: t.yellow,  label: "📞 Contacted", next: "done" },
    done:      { color: "#25d366", label: "✅ Done",      next: "new" },
  };
  const s = statusMap[lead.status] || statusMap.new;

  const date = lead.submittedAt?.toDate
    ? lead.submittedAt.toDate().toLocaleString("en-IN", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : "Just now";

  const handleStatus = async () => {
    setSaving(true);
    await onUpdate(lead.id, { status: s.next });
    setSaving(false);
  };

  const openWA = () => {
    const msg = encodeURIComponent(
      `Hi ${lead.name}! 👋 This is HackSecure team. We received your inquiry${lead.serviceTitle ? ` regarding "${lead.serviceTitle}"` : ""}. How can we help you today?`
    );
    window.open(`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div style={{
      background: t.cardBg,
      border: `1px solid ${expanded ? s.color : t.border}`,
      borderRadius: 14, marginBottom: 10, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Row header */}
      <div style={{
        padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
        borderLeft: `4px solid ${s.color}`,
      }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "flex", gap: 14, alignItems: "center",
            flexWrap: "wrap", flex: 1, cursor: "pointer",
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg,${s.color},${dark ? "#007755" : "#004d3a"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#fff",
          }}>
            {lead.name?.slice(0, 2).toUpperCase() || "?"}
          </div>

          {/* Name + WA */}
          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{lead.name}</div>
            <div style={{ color: "#25d366", fontSize: 12, fontFamily: C }}>💬 {lead.whatsapp}</div>
          </div>

          {/* Service */}
          {lead.serviceTitle && (
            <div style={{
              padding: "3px 10px",
              borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`,
            }}>
              <div style={{ color: t.accent, fontSize: 12, fontFamily: C }}>
                {lead.serviceId ? "🎯" : ""} {lead.serviceTitle}
              </div>
              <div style={{ color: t.textMuted, fontSize: 11 }}>{date}</div>
            </div>
          )}

          {/* Requirement preview */}
          <div style={{
            color: t.textSub, fontSize: 12,
            maxWidth: 220, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {lead.requirement}
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {/* WA Button */}
          <button
            onClick={openWA}
            title="Open WhatsApp Chat"
            style={{
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.3)",
              borderRadius: 8, padding: "7px 14px",
              color: "#25d366", cursor: "pointer",
              fontFamily: C, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.1)"}
          >
            💬 WhatsApp
          </button>

          {/* Status pill */}
          <button
            onClick={handleStatus}
            disabled={saving}
            title="Click to advance status"
            style={{
              background: s.color + "18",
              border: `1px solid ${s.color}50`,
              borderRadius: 20, padding: "5px 12px",
              color: s.color, cursor: "pointer",
              fontFamily: C, fontSize: 11, fontWeight: 700,
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = s.color + "30"}
            onMouseLeave={e => e.currentTarget.style.background = s.color + "18"}
          >
            {saving ? "..." : s.label}
          </button>

          <span
            onClick={() => setExpanded(!expanded)}
            style={{ color: t.textMuted, fontSize: 16, cursor: "pointer" }}
          >
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: "0 18px 22px",
          borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 20, padding: "18px 0 16px",
          }}>
            {[
              ["Full Name", lead.name],
              ["WhatsApp", lead.whatsapp],
              ["Email", lead.email || "—"],
              ["Service Interested", lead.serviceTitle || "General Inquiry"],
              ["Submitted", date],
              ["Status", s.label],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{
                  color: t.textMuted, fontSize: 10,
                  letterSpacing: "0.1em", marginBottom: 4,
                }}>{k.toUpperCase()}</div>
                <div style={{ color: t.text, fontSize: 13, wordBreak: "break-all" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Full requirement */}
          <div style={{
            background: dark ? "rgba(0,255,204,0.04)" : "rgba(0,100,70,0.04)",
            border: `1px solid ${t.border}`,
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
          }}>
            <div style={{
              color: t.accent, fontSize: 10,
              letterSpacing: "0.12em", marginBottom: 8,
            }}>REQUIREMENT</div>
            <div style={{ color: t.textSub, fontSize: 13, lineHeight: 1.7 }}>
              {lead.requirement}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={openWA}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(37,211,102,0.1)",
                border: "1px solid rgba(37,211,102,0.3)",
                borderRadius: 8, padding: "10px 18px",
                color: "#25d366", cursor: "pointer",
                fontFamily: C, fontSize: 13, fontWeight: 700,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.1)"}
            >
              💬 Open WhatsApp Chat
            </button>

            {lead.email && (
              <a
                href={`mailto:${lead.email}?subject=Re: HackSecure Inquiry&body=Hi ${lead.name},%0A%0AThank you for reaching out to HackSecure.`}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: t.accentDim,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8, padding: "10px 18px",
                  color: t.accent, textDecoration: "none",
                  fontFamily: C, fontSize: 13, fontWeight: 700,
                }}
              >
                📧 Send Email
              </a>
            )}

            <button
              onClick={() => onUpdate(lead.id, { status: "contacted" })}
              style={{
                background: "transparent",
                border: `1px solid ${t.yellow}50`,
                borderRadius: 8, padding: "10px 16px",
                color: t.yellow, cursor: "pointer",
                fontFamily: C, fontSize: 12,
              }}
            >📞 Mark Contacted</button>

            <button
              onClick={() => onUpdate(lead.id, { status: "done" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(37,211,102,0.3)",
                borderRadius: 8, padding: "10px 16px",
                color: "#25d366", cursor: "pointer",
                fontFamily: C, fontSize: 12,
              }}
            >✅ Mark Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PANEL ──────────────────────────────────────────────────────────
export default function AdminPanel({ onBack }) {
  const { t, dark, toggle } = useTheme();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passErr, setPassErr] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [qrPreview, setQrPreview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("all");

  // Load QR preview on mount
  useEffect(() => {
    getDoc(doc(db, "settings", "qr")).then(snap => {
      if (snap.exists()) setQrPreview(snap.data().url);
    });
  }, []);

  // Load orders + users realtime after auth
  useEffect(() => {
    if (!authed) return;
    const o = onSnapshot(query(collection(db, "orders"), orderBy("placedAt", "desc")), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const u = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const l = onSnapshot(query(collection(db, "leads"), orderBy("submittedAt", "desc")), snap => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { o(); u(); l(); };
  }, [authed]);

  const handleOrderUpdate = async (orderId, fields) => {
    await updateDoc(doc(db, "orders", orderId), fields);
  };

  const handleLeadUpdate = async (leadId, fields) => {
    await updateDoc(doc(db, "leads", leadId), fields);
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await setDoc(doc(db, "settings", "qr"), { url: reader.result });
      setQrPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Analytics
  const revenue = useMemo(() => orders.filter(o => o.status === "approved").reduce((s, o) => s + (o.price || 0), 0), [orders]);
  const pendingRevenue = useMemo(() => orders.filter(o => o.status === "pending").reduce((s, o) => s + (o.price || 0), 0), [orders]);

  const serviceBreakdown = useMemo(() => {
    const map = {};
    orders.forEach(o => { map[o.service] = (map[o.service] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  // Filter + sort orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (filter !== "all") list = list.filter(o => o.status === filter);
    if (serviceFilter !== "all") list = list.filter(o => o.service === serviceFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(o =>
        o.userName?.toLowerCase().includes(s) ||
        o.userEmail?.toLowerCase().includes(s) ||
        o.id?.toLowerCase().includes(s) ||
        o.txnId?.toLowerCase().includes(s) ||
        o.service?.toLowerCase().includes(s)
      );
    }
    if (sortBy === "oldest") list.reverse();
    else if (sortBy === "highest") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "lowest") list.sort((a, b) => a.price - b.price);
    return list;
  }, [orders, filter, serviceFilter, search, sortBy]);

  const uniqueServices = [...new Set(orders.map(o => o.service))];
  const counts = { all: orders.length, pending: orders.filter(o => o.status === "pending").length, approved: orders.filter(o => o.status === "approved").length, rejected: orders.filter(o => o.status === "rejected").length };

  const newLeadsCount = leads.filter(l => l.status === "new" || !l.status).length;

  const filteredLeads = useMemo(() => {
    let list = [...leads];
    if (leadFilter !== "all") list = list.filter(l => (l.status || "new") === leadFilter);
    if (leadSearch) {
      const s = leadSearch.toLowerCase();
      list = list.filter(l =>
        l.name?.toLowerCase().includes(s) ||
        l.whatsapp?.includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.requirement?.toLowerCase().includes(s) ||
        l.serviceTitle?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [leads, leadFilter, leadSearch]);

  // ── LOGIN ──
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: t.bg, fontFamily: C,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
        backgroundSize: "50px 50px",
      }}>
        <button onClick={toggle} style={{ position: "absolute", top: 20, right: 20, background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 14px", color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 12 }}>
          {dark ? "☀️" : "🌙"}
        </button>
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 380,
          boxShadow: t.shadow,
        }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
            <div style={{ color: t.accent, fontSize: 18, fontWeight: 900, letterSpacing: "0.1em" }}>ADMIN PANEL</div>
            <div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>HackSecure Internal Access Only</div>
          </div>
          <form onSubmit={e => { e.preventDefault(); if (password === ADMIN_PASSWORD) setAuthed(true); else setPassErr("Incorrect password."); }}>
            <input type="password" placeholder="Admin Password" value={password}
              onChange={e => { setPassword(e.target.value); setPassErr(""); }}
              style={{
                width: "100%", padding: "12px 14px", background: t.inputBg,
                border: `1px solid ${t.inputBorder}`, borderRadius: 8, color: t.text,
                fontSize: 14, fontFamily: C, boxSizing: "border-box", outline: "none", marginBottom: 10,
              }}
              onFocus={e => e.target.style.borderColor = t.accent}
              onBlur={e => e.target.style.borderColor = t.inputBorder}
            />
            {passErr && <div style={{ color: t.red, fontSize: 13, marginBottom: 10 }}>{passErr}</div>}
            <button type="submit" style={{
              width: "100%", padding: 13, background: t.accent, color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 900, fontSize: 14,
              cursor: "pointer", fontFamily: C, letterSpacing: "0.06em",
              boxShadow: `0 0 20px ${t.accentGlow}`,
            }}>ACCESS PANEL →</button>
          </form>
          <button onClick={onBack} style={{
            width: "100%", marginTop: 10, padding: 10,
            background: "transparent", border: `1px solid ${t.border}`,
            borderRadius: 8, color: t.textMuted, cursor: "pointer", fontFamily: C, fontSize: 12,
          }}>← Back to Site</button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "leads",     label: `📥 Leads${newLeadsCount > 0 ? ` (${newLeadsCount} new)` : ` (${leads.length})`}` },
    { id: "orders",    label: `📋 Orders (${counts.all})` },
    { id: "qr",        label: "📱 QR Code" },
    { id: "users",     label: `👥 Users (${users.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: C, color: t.text }}>
      {/* Topbar */}
      <div style={{
        background: t.navBg, backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${t.border}`,
        padding: "0 5%", height: 64, position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)",
            borderRadius: 6, padding: "3px 10px", color: t.red, fontSize: 11, letterSpacing: "0.1em",
          }}>ADMIN</div>
          <span style={{ color: t.accent, fontWeight: 900, fontSize: 16, letterSpacing: "0.08em" }}>HackSecure Panel</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={toggle} style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", color: t.textSub, cursor: "pointer", fontFamily: C, fontSize: 12 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={onBack} style={{ background: "none", border: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", padding: "6px 14px", borderRadius: 6, fontFamily: C, fontSize: 12 }}>← Exit</button>
        </div>
      </div>

      {/* Sub nav */}
      <div style={{ background: t.bg2, borderBottom: `1px solid ${t.border}`, padding: "0 5%", display: "flex", gap: 4, overflowX: "auto" }}>
        {navTabs.map(nt => (
          <button key={nt.id} onClick={() => setTab(nt.id)} style={{
            padding: "14px 18px", border: "none", background: "none",
            color: tab === nt.id ? t.accent : t.textMuted,
            borderBottom: `2px solid ${tab === nt.id ? t.accent : "transparent"}`,
            fontFamily: C, fontSize: 13, cursor: "pointer",
            fontWeight: tab === nt.id ? 700 : 400,
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{nt.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 5%" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              <StatCard icon="📥" label="Total Leads" value={leads.length} t={t} sub="Enquiries received" />
              <StatCard icon="🆕" label="New Leads" value={newLeadsCount} color={t.accent} t={t} sub="Needs follow-up" />
              <StatCard icon="📋" label="Total Orders" value={counts.all} t={t} />
              <StatCard icon="⏳" label="Pending" value={counts.pending} color={t.yellow} t={t} sub="Needs review" />
              <StatCard icon="✅" label="Approved" value={counts.approved} color={t.accent} t={t} />
              <StatCard icon="💰" label="Revenue" value={`₹${(revenue / 1000).toFixed(1)}k`} color={t.accent} t={t} sub="Approved orders" />
              <StatCard icon="👥" label="Users" value={users.length} t={t} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flexWrap: "wrap" }}>
              {/* Top services */}
              <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ color: t.accent, fontSize: 11, letterSpacing: "0.12em", marginBottom: 16 }}>TOP SERVICES</div>
                {serviceBreakdown.length === 0 ? (
                  <div style={{ color: t.textMuted, fontSize: 13 }}>No data yet.</div>
                ) : serviceBreakdown.map(([svc, cnt], i) => (
                  <div key={svc} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ color: t.textMuted, fontSize: 12, width: 16 }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: t.text, fontSize: 13, marginBottom: 4 }}>{svc}</div>
                      <div style={{ background: t.bg3, borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: t.accent, width: `${(cnt / counts.all) * 100}%`, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ color: t.accent, fontWeight: 700, fontSize: 14 }}>{cnt}</div>
                  </div>
                ))}
              </div>

              {/* Recent pending */}
              <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ color: t.yellow, fontSize: 11, letterSpacing: "0.12em", marginBottom: 16 }}>PENDING ORDERS</div>
                {orders.filter(o => o.status === "pending").slice(0, 5).map(o => (
                  <div key={o.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0", borderBottom: `1px solid ${t.border}`,
                  }}>
                    <div>
                      <div style={{ color: t.text, fontSize: 13, fontWeight: 700 }}>{o.userName}</div>
                      <div style={{ color: t.textMuted, fontSize: 11 }}>{o.service}</div>
                    </div>
                    <div style={{ color: t.accent, fontWeight: 700, fontSize: 14 }}>₹{o.price?.toLocaleString()}</div>
                  </div>
                ))}
                {orders.filter(o => o.status === "pending").length === 0 && (
                  <div style={{ color: t.textMuted, fontSize: 13 }}>No pending orders 🎉</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADS ── */}
        {tab === "leads" && (
          <div>
            {/* Lead stats bar */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { key: "all",       label: "All",       count: leads.length,                                             color: t.text },
                { key: "new",       label: "🆕 New",       count: leads.filter(l => (l.status||"new") === "new").length,       color: t.accent },
                { key: "contacted", label: "📞 Contacted", count: leads.filter(l => l.status === "contacted").length, color: t.yellow },
                { key: "done",      label: "✅ Done",      count: leads.filter(l => l.status === "done").length,      color: "#25d366" },
              ].map(f => (
                <button key={f.key} onClick={() => setLeadFilter(f.key)} style={{
                  padding: "7px 14px",
                  border: `1px solid ${leadFilter === f.key ? f.color : t.border}`,
                  borderRadius: 8,
                  background: leadFilter === f.key ? f.color + "20" : "transparent",
                  color: leadFilter === f.key ? f.color : t.textMuted,
                  fontSize: 12, fontFamily: C, cursor: "pointer", transition: "all 0.2s",
                }}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 20 }}>
              <input
                placeholder="🔍 Search name, WhatsApp, email, requirement, service…"
                value={leadSearch}
                onChange={e => setLeadSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                  borderRadius: 8, color: t.text, fontSize: 13,
                  fontFamily: C, outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.inputBorder}
              />
            </div>

            <div style={{ color: t.textMuted, fontSize: 12, marginBottom: 14 }}>
              Showing {filteredLeads.length} of {leads.length} leads
              {newLeadsCount > 0 && (
                <span style={{
                  marginLeft: 12, background: t.accentDim,
                  border: `1px solid ${t.border}`, borderRadius: 20,
                  padding: "2px 10px", color: t.accent, fontSize: 11,
                }}>
                  ● {newLeadsCount} need follow-up
                </span>
              )}
            </div>

            {filteredLeads.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                border: `1px dashed ${t.border}`, borderRadius: 12,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📥</div>
                <div style={{ color: t.textMuted, fontSize: 14 }}>
                  {leads.length === 0 ? "No leads yet. Share your site link!" : "No leads match your filter."}
                </div>
              </div>
            ) : (
              filteredLeads.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onUpdate={handleLeadUpdate}
                  t={t}
                  dark={dark}
                />
              ))
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {["all", "pending", "approved", "rejected"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "7px 14px", border: `1px solid ${filter === f ? t.accent : t.border}`,
                  borderRadius: 8, background: filter === f ? t.accentDim : "transparent",
                  color: filter === f ? t.accent : t.textMuted,
                  fontSize: 12, fontFamily: C, cursor: "pointer", transition: "all 0.2s",
                }}>{f.toUpperCase()} ({counts[f]})</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <input
                placeholder="🔍 Search name, email, order ID, UTR, service..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 2, minWidth: 200, padding: "9px 14px",
                  background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                  borderRadius: 8, color: t.text, fontSize: 13,
                  fontFamily: C, outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.inputBorder}
              />
              <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={{
                flex: 1, minWidth: 160, padding: "9px 12px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: 8, color: t.text, fontSize: 13, fontFamily: C, cursor: "pointer",
              }}>
                <option value="all">All Services</option>
                {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                padding: "9px 12px",
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: 8, color: t.text, fontSize: 13, fontFamily: C, cursor: "pointer",
              }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Price</option>
                <option value="lowest">Lowest Price</option>
              </select>
            </div>

            <div style={{ color: t.textMuted, fontSize: 12, marginBottom: 14 }}>
              Showing {filteredOrders.length} of {orders.length} orders
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", border: `1px dashed ${t.border}`, borderRadius: 12, color: t.textMuted }}>
                No orders found.
              </div>
            ) : (
              filteredOrders.map(o => (
                <OrderRow key={o.id} order={o} onUpdate={handleOrderUpdate} t={t} />
              ))
            )}
          </div>
        )}

        {/* ── QR CODE ── */}
        {tab === "qr" && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ color: t.accent, fontSize: 12, letterSpacing: "0.15em", marginBottom: 6 }}>PAYMENT QR CODE</div>
            <p style={{ color: t.textSub, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
              This QR is shown to users when they're paying for a service. Upload your UPI QR code from PhonePe, GPay, or Paytm.
            </p>
            <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 28, marginBottom: 18, textAlign: "center" }}>
              {qrPreview ? (
                <>
                  <img src={qrPreview} alt="QR" style={{ width: 220, height: 220, objectFit: "contain", borderRadius: 10, background: "#fff", padding: 10, boxShadow: `0 0 30px ${t.accentGlow}` }} />
                  <div style={{ color: t.accent, fontSize: 12, marginTop: 14, letterSpacing: "0.08em" }}>✅ QR CODE ACTIVE — LIVE</div>
                  <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4 }}>Users see this in real-time via Firestore</div>
                </>
              ) : (
                <div style={{ padding: "40px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📱</div>
                  <div style={{ color: t.textMuted, fontSize: 14 }}>No QR uploaded yet.</div>
                </div>
              )}
            </div>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: t.accent, color: "#fff", border: "none", borderRadius: 10,
              padding: "14px 20px", fontWeight: 900, fontSize: 14, cursor: "pointer",
              fontFamily: C, letterSpacing: "0.06em",
              boxShadow: `0 0 20px ${t.accentGlow}`,
            }}>
              📤 UPLOAD NEW QR CODE
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRUpload} />
            </label>
            {qrPreview && (
              <button onClick={async () => { await deleteDoc(doc(db, "settings", "qr")); setQrPreview(null); }} style={{
                width: "100%", marginTop: 10, padding: 11,
                background: "transparent", border: `1px solid ${t.red}40`,
                borderRadius: 10, color: t.red, cursor: "pointer", fontFamily: C, fontSize: 12,
              }}>🗑️ Remove QR Code</button>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <div style={{ color: t.accent, fontSize: 12, letterSpacing: "0.15em", marginBottom: 18 }}>
              REGISTERED USERS ({users.length})
            </div>
            {users.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", border: `1px dashed ${t.border}`, borderRadius: 12, color: t.textMuted }}>No users yet.</div>
            ) : users.map(u => {
              const uOrders = orders.filter(o => o.userId === u.uid || o.userId === u.id);
              const uRevenue = uOrders.filter(o => o.status === "approved").reduce((s, o) => s + (o.price || 0), 0);
              return (
                <div key={u.id} style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: "16px 20px", marginBottom: 10,
                  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: `linear-gradient(135deg,${t.accent},${dark ? "#007755" : "#004d3a"})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: 15, color: "#fff", flexShrink: 0,
                    }}>{u.avatar || u.name?.slice(0, 2).toUpperCase() || "?"}</div>
                    <div>
                      <div style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                      <div style={{ color: t.textMuted, fontSize: 12 }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[["Orders", uOrders.length, t.text], ["Approved", uOrders.filter(o => o.status === "approved").length, t.accent], ["Revenue", `₹${(uRevenue / 1000).toFixed(1)}k`, t.accent]].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ color, fontWeight: 900, fontSize: 18 }}>{val}</div>
                        <div style={{ color: t.textMuted, fontSize: 10 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
