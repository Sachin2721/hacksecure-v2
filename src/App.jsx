import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import MainSite from "./pages/MainSite";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import { SERVICES } from "./data/services";
import "./index.css";

function determineInitialView() {
  // 1. Check URL hash first
  const hash = window.location.hash;
  if (hash === "#admin") return "admin";
  if (hash === "#site") return "site";
  if (hash === "#landing") return "landing";
  if (hash === "#login") return "auth";

  // 2. Check query params (e.g. redirected from landing domain with ?lead=done)
  const params = new URLSearchParams(window.location.search);
  if (params.get("lead") === "done") {
    localStorage.setItem("hs_lead_done", "1");
    return "site";
  }

  // 3. Check explicit environment mode
  const mode = import.meta.env.VITE_APP_MODE; // "landing" | "site" | "auto"
  if (mode === "site") return "site";
  if (mode === "landing") return "landing";

  // 4. Auto-detect from domain/subdomain
  const host = window.location.hostname.toLowerCase();
  if (host.includes("landing") || host.includes("promo") || host.includes("ads")) {
    return "landing";
  }
  if (host.includes("app.") || host.includes("dashboard.") || host.includes("main.")) {
    return "site";
  }

  // 5. Default
  return "landing";
}

function AppInner() {
  const { user, logout } = useAuth();
  const [view, setView] = useState(determineInitialView);
  const [authMode, setAuthMode] = useState("login");
  const [pendingService, setPendingService] = useState(null);
  const [selectedDetailService, setSelectedDetailService] = useState(null);

  // Handle incoming query params (?lead=done & ?service=id)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lead") === "done") {
      localStorage.setItem("hs_lead_done", "1");
      const serviceId = params.get("service");
      if (serviceId) {
        const found = SERVICES.find((s) => s.id === serviceId);
        if (found) {
          setSelectedDetailService(found);
          setPendingService(found);
        }
      }
    }
  }, []);

  // Handle URL hash changes (#admin, #site, #landing, #login)
  useEffect(() => {
    const check = () => {
      const hash = window.location.hash;
      if (hash === "#admin") setView("admin");
      else if (hash === "#site") setView("site");
      else if (hash === "#landing") setView("landing");
      else if (hash === "#login") {
        setAuthMode("login");
        setView("auth");
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  // After login, redirect to profile if pending service
  useEffect(() => {
    if (user && view === "auth") {
      setView("profile");
    }
  }, [user]);

  // Main Site Service Click: Directly open service detail page (NO form on main site)
  const handleServiceClick = (service) => {
    setSelectedDetailService(service);
    setView("service-detail");
  };

  const handleSelectPlan = (service) => {
    const target = service || selectedDetailService;
    setPendingService(target);
    if (!user) {
      setAuthMode("login");
      setView("auth");
    } else {
      setView("profile");
    }
  };

  const handleLogout = async () => {
    await logout();
    setPendingService(null);
    setSelectedDetailService(null);
    setView("landing");
    window.location.hash = "";
  };

  if (view === "landing") {
    return (
      <LandingPage
        onEnterSite={() => {
          setView("site");
          window.location.hash = "#site";
        }}
        onServiceSelect={(svc) => {
          setSelectedDetailService(svc);
          setView("service-detail");
        }}
        onLoginClick={() => {
          setAuthMode("login");
          setView("auth");
        }}
      />
    );
  }

  if (view === "service-detail" && selectedDetailService) {
    return (
      <ServiceDetailPage
        service={selectedDetailService}
        onSelectPlan={() => handleSelectPlan(selectedDetailService)}
        onBack={() => {
          setView("site");
          setSelectedDetailService(null);
        }}
      />
    );
  }

  if (view === "admin") {
    return <AdminPanel onBack={() => { setView("landing"); window.location.hash = ""; }} />;
  }

  if (view === "auth") {
    return (
      <AuthPage
        mode={authMode}
        onBack={() => { setView("site"); setPendingService(null); }}
      />
    );
  }

  if (view === "profile" && user) {
    return (
      <ProfilePage
        pendingService={pendingService}
        clearPendingService={() => setPendingService(null)}
        onBack={() => setView("site")}
      />
    );
  }

  return (
    <MainSite
      onServiceClick={handleServiceClick}
      onLandingClick={() => {
        setView("landing");
        window.location.hash = "#landing";
      }}
      onLoginClick={() => { setAuthMode("login"); setView("auth"); }}
      onProfileClick={() => setView("profile")}
      onLogout={handleLogout}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
