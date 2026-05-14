import { useEffect, useState } from "react";
import { Navbar, type NavView } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Dashboard } from "./components/Dashboard";
import { AIAnalysis } from "./components/AIAnalysis";
import { AlertsPage } from "./components/AlertsPage";
import { AboutEngine } from "./components/AboutEngine";
import { AdminPanel } from "./components/AdminPanel";
import { Footer } from "./components/Footer";
import { Chatbot } from "./components/Chatbot";
import { VoiceFraudLab } from "./components/VoiceFraudLab";

const idToView: Record<string, NavView> = {
  home: "home",
  dashboard: "dashboard",
  analysis: "analysis",
  "voice-fraud": "voice",
  alerts: "alerts",
  "about-engine": "about",
  admin: "admin",
  contact: "contact",
};

export default function App() {
  const [active, setActive] = useState<NavView>("home");

  function navigate(v: NavView) {
    setActive(v);
    if (v === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const map: Record<NavView, string> = {
      home: "home",
      dashboard: "dashboard",
      analysis: "analysis",
      voice: "voice-fraud",
      alerts: "alerts",
      about: "about-engine",
      admin: "admin",
      contact: "contact",
    };
    window.requestAnimationFrame(() => {
      document.getElementById(map[v])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    const observed = [
      "home",
      "dashboard",
      "analysis",
      "voice-fraud",
      "alerts",
      "about-engine",
      "admin",
      "contact",
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.18)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) {
          const nv = idToView[top.target.id];
          if (nv) setActive(nv);
        }
      },
      { root: null, rootMargin: "-14% 0px -48% 0px", threshold: [0.12, 0.22, 0.32] }
    );
    observed.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100">
      <Navbar active={active} onNavigate={navigate} />
      <Hero onNavigate={navigate} />
      <Features />
      <Dashboard />
      <AIAnalysis />
      <VoiceFraudLab />
      <AlertsPage />
      <AboutEngine />
      <AdminPanel />
      <Footer />
      <Chatbot />
    </div>
  );
}
