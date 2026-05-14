import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Ban, Bug, Globe2, Shield, Users } from "lucide-react";
import { attackCategories, mapHotspots, trafficSeries } from "../data/dummyData";
import { LiveTerminal } from "./LiveTerminal";
import { ThreatHeatmap } from "./ThreatHeatmap";
import { VoiceAlertBar } from "./VoiceAlertBar";

type ThreatLevel = "Low" | "Medium" | "High" | "Critical";

function levelIndex(l: ThreatLevel) {
  return { Low: 0, Medium: 1, High: 2, Critical: 3 }[l];
}

export function Dashboard() {
  const [level, setLevel] = useState<ThreatLevel>("Medium");
  const [attacks, setAttacks] = useState(1284);
  const [users, setUsers] = useState(842);
  const [blocked, setBlocked] = useState(312);
  const [malware, setMalware] = useState(47);
  const [confidence, setConfidence] = useState(94.2);
  const [traffic, setTraffic] = useState(trafficSeries);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAttacks((n) => n + ((Math.random() * 5) | 0));
      setUsers((n) => n + ((Math.random() * 3 - 1) | 0));
      setBlocked((n) => n + ((Math.random() * 2) | 0));
      setMalware((n) => Math.max(30, n + ((Math.random() * 3 - 1) | 0)));
      setConfidence((c) =>
        Math.min(99.4, Math.max(88, +(c + (Math.random() * 0.4 - 0.2)).toFixed(1)))
      );
      const roll = Math.random();
      setLevel(
        roll > 0.92 ? "Critical" : roll > 0.75 ? "High" : roll > 0.45 ? "Medium" : "Low"
      );
      setTraffic((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next.shift();
        next.push({
          t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mb: Math.max(
            80,
            last.mb + ((Math.random() * 80 - 35) | 0)
          ),
        });
        return next;
      });
      if (Math.random() > 0.65) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 400);
      }
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const gauge = useMemo(() => levelIndex(level), [level]);

  return (
    <section id="dashboard" className="relative py-24">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/90">
          Live threat dashboard
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Unified visibility &amp; response
        </h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Auto-refreshing metrics, synthetic traffic, and animated attack surface for your
          hackathon jury walkthrough.
        </p>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-40 bg-rose-500 mix-blend-screen"
            />
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass neon-border relative overflow-hidden rounded-2xl p-6 lg:col-span-1">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),transparent_55%)]" />
            <p className="text-sm font-medium text-slate-400">Threat level</p>
            <div className="mt-4 flex items-end gap-2">
              <span
                className={`text-4xl font-bold tracking-tight ${
                  level === "Critical"
                    ? "text-rose-400 animate-pulse"
                    : level === "High"
                      ? "text-orange-300"
                      : level === "Medium"
                        ? "text-amber-200"
                        : "text-emerald-300"
                }`}
              >
                {level}
              </span>
              <Shield className="mb-1 h-8 w-8 text-cyan-400/80" />
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-500"
                animate={{ width: `${25 + gauge * 25}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Composite score across identity, endpoint, email, and cloud control planes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {[
              { label: "Live attacks / hr", value: attacks.toLocaleString(), icon: Activity },
              { label: "Active users", value: users.toLocaleString(), icon: Users },
              { label: "Blocked IPs", value: blocked.toLocaleString(), icon: Ban },
              { label: "Malware detections", value: malware.toLocaleString(), icon: Bug },
            ].map((c) => (
              <div
                key={c.label}
                className="glass group rounded-2xl border border-white/10 p-5 transition hover:border-cyan-500/35 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {c.label}
                  </p>
                  <c.icon className="h-4 w-4 text-cyan-400/80 transition group-hover:scale-110" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white tabular-nums">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-2xl border border-white/10 p-4 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Real-time traffic</p>
              <span className="text-xs text-slate-500">Mbps aggregate (sim)</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic}>
                  <defs>
                    <linearGradient id="fillTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(56,189,248,0.25)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mb"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fill="url(#fillTraffic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">Attack categories</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackCategories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {attackCategories.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="rgba(15,23,42,0.8)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(167,139,250,0.25)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-2xl border border-cyan-500/20 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Globe2 className="h-4 w-4 text-cyan-300" />
                Attack origins
              </p>
              <span className="text-xs text-slate-500">geo clusters (illustrative)</span>
            </div>
            <svg viewBox="0 0 100 52" className="h-56 w-full text-slate-700">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path
                fill="currentColor"
                opacity="0.35"
                d="M10 28 Q25 10 40 26 T70 24 T95 30 L95 50 L5 50 Z"
              />
              <circle cx="50" cy="26" r="22" fill="url(#glow)" className="animate-pulseSlow" />
              {mapHotspots.map((p) => (
                <g key={p.label}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.2"
                    className="fill-cyan-400"
                    style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
                  />
                  <circle cx={p.x} cy={p.y} r="6" className="fill-cyan-400/15 animate-ping" />
                </g>
              ))}
            </svg>
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-500/40"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-semibold text-white">AI confidence</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto flex h-28 w-28 items-center justify-center sm:mx-0">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 210deg, #34d399, #38bdf8 ${confidence}%, #1e293b 0)`,
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                    }}
                  />
                  <div className="relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-slate-950 ring-1 ring-white/10">
                    <motion.span
                      key={confidence}
                      initial={{ scale: 0.92, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xl font-bold text-white"
                    >
                      {confidence}%
                    </motion.span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      ensemble
                    </span>
                  </div>
                </div>
                <p className="flex-1 text-sm text-slate-400">
                  Model agreement across ensemble heads. Drops trigger analyst review and
                  shadow-mode validation.
                </p>
              </div>
            </div>
            <VoiceAlertBar />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ThreatHeatmap />
          <LiveTerminal />
        </div>
      </div>
    </section>
  );
}
