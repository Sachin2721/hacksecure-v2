import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import MainSite from "./pages/MainSite";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import LeadCapturePage from "./pages/LeadCapturePage";
import "./index.css";

function AppInner() {
  const { user, logout } = useAuth();
  // Default to landing page for ads & first-time visitors
  const [view, setView] = useState("landing"); // landing | site | auth | profile | admin | lead
  const [authMode, setAuthMode] = useState("login");
  const [pendingService, setPendingService] = useState(null);
  const [leadService, setLeadService] = useState(null);

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

  const handleServiceClick = (service) => {
    // If lead form already done, skip it
    if (localStorage.getItem("hs_lead_done") === "1") {
      setPendingService(service);
      if (!user) {
        setAuthMode("login");
        setView("auth");
      } else {
        setView("profile");
      }
      return;
    }
    // Otherwise show lead capture form first
    setLeadService(service);
    setView("lead");
  };

  const handleLeadProceed = () => {
    const svc = leadService;
    setLeadService(null);
    setView("site");
    if (svc) {
      setPendingService(svc);
      if (!user) {
        setAuthMode("login");
        setView("auth");
      } else {
        setView("profile");
      }
    }
  };

  const handleLeadSkip = () => {
    setLeadService(null);
    setView("site");
  };

  const handleLogout = async () => {
    await logout();
    setPendingService(null);
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
          handleServiceClick(svc);
        }}
        onLoginClick={() => {
          setAuthMode("login");
          setView("auth");
        }}
      />
    );
  }

  if (view === "lead") {
    return (
      <LeadCapturePage
        service={leadService}
        onProceed={handleLeadProceed}
        onSkip={handleLeadSkip}
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
        onBack={() => { setView("landing"); setPendingService(null); }}
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
