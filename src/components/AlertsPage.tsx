import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Radio } from "lucide-react";
import type { AlertItem, AlertSeverity, AlertStatus } from "../data/dummyData";
import { initialAlerts } from "../data/dummyData";

const severities: AlertSeverity[] = ["Low", "Medium", "High", "Critical"];

function severityStyles(s: AlertSeverity) {
  switch (s) {
    case "Low":
      return "bg-slate-500/20 text-slate-200 ring-slate-400/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-200 ring-amber-400/35";
    case "High":
      return "bg-orange-500/15 text-orange-200 ring-orange-400/35";
    default:
      return "bg-rose-500/20 text-rose-100 ring-rose-400/40 animate-pulse";
  }
}

function statusStyles(s: AlertStatus) {
  switch (s) {
    case "Blocked":
      return "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30";
    case "Investigating":
      return "bg-cyan-500/15 text-cyan-100 ring-cyan-400/35";
    default:
      return "bg-slate-500/15 text-slate-200 ring-slate-400/25";
  }
}

function randomIp() {
  return `${192 + (Math.random() * 63) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

  useEffect(() => {
    const id = window.setInterval(() => {
      const sev = severities[(Math.random() * severities.length) | 0];
      const statuses: AlertStatus[] = ["Blocked", "Investigating", "Safe"];
      const types = [
        "DNS tunneling",
        "Ransomware precursor",
        "OAuth token replay",
        "Port scan",
        "Data exfiltration",
      ];
      const next: AlertItem = {
        id: `ALT-${(9000 + Math.random() * 999) | 0}`,
        timestamp: new Date().toISOString(),
        sourceIp: randomIp(),
        threatType: types[(Math.random() * types.length) | 0],
        severity: sev,
        status: statuses[(Math.random() * statuses.length) | 0],
      };
      setAlerts((prev) => [next, ...prev].slice(0, 12));
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="alerts" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-rose-300/90">
              Alerts & incidents
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Live SOC feed
            </h2>
            <p className="mt-2 max-w-xl text-slate-400">
              Streaming prototype events with severity-coded badges and animated
              critical indicators.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <Radio className="h-4 w-4 animate-pulse text-rose-300" />
            Live ingest — demo simulation
          </div>
        </div>

        <div className="glass neon-border overflow-hidden rounded-2xl border border-rose-500/20">
          <div className="grid grid-cols-6 gap-2 border-b border-white/10 bg-slate-950/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
            <span className="col-span-2 sm:col-span-1">Time</span>
            <span className="hidden sm:block">Source IP</span>
            <span className="col-span-2">Threat</span>
            <span>Severity</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-white/5">
            {alerts.map((a, i) => (
              <motion.div
                key={`${a.timestamp}-${i}`}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`grid grid-cols-6 items-center gap-2 px-4 py-4 text-sm sm:px-6 ${
                  a.severity === "Critical" ? "bg-rose-500/5" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="col-span-2 font-mono text-xs text-slate-400 sm:col-span-1">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </div>
                <div className="hidden font-mono text-xs text-cyan-200/90 sm:block">
                  {a.sourceIp}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {a.severity === "Critical" && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 animate-blink" />
                  )}
                  <span className="text-slate-100">{a.threatType}</span>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${severityStyles(a.severity)}`}
                  >
                    {a.severity}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyles(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
