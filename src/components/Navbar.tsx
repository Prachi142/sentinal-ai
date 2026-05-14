import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";

export type NavView =
  | "home"
  | "dashboard"
  | "analysis"
  | "alerts"
  | "about"
  | "admin"
  | "contact";

const links: { label: string; view: NavView }[] = [
  { label: "Home", view: "home" },
  { label: "Dashboard", view: "dashboard" },
  { label: "AI Analysis", view: "analysis" },
  { label: "Alerts", view: "alerts" },
  { label: "AI Engine", view: "about" },
  { label: "Admin", view: "admin" },
  { label: "Contact", view: "contact" },
];

export function Navbar({
  active,
  onNavigate,
}: {
  active: NavView;
  onNavigate: (v: NavView) => void;
}) {
  const [open, setOpen] = useState(false);

  function go(v: NavView) {
    onNavigate(v);
    setOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => go("home")}
          className="flex items-center gap-2 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-glow">
            <Shield className="h-5 w-5 text-slate-950" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-white">
              Sentinel AI
            </span>
            <span className="block text-[11px] text-slate-400">
              Real-Time Intelligent Threat Detection
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.view}
              type="button"
              onClick={() => go(l.view)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active === l.view
                  ? "bg-white/10 text-white shadow-glow"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-slate-950/95 md:hidden"
          >
            <div className="flex flex-col px-4 py-3">
              {links.map((l) => (
                <button
                  key={l.view}
                  type="button"
                  onClick={() => go(l.view)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    active === l.view ? "bg-white/10 text-white" : "text-slate-300"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
