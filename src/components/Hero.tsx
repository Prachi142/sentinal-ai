import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import type { NavView } from "./Navbar";

export function Hero({ onNavigate }: { onNavigate: (v: NavView) => void }) {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] overflow-hidden pt-28 sm:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[length:48px_48px] opacity-40 animate-grid" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <motion.div
          className="absolute inset-x-0 h-40 bg-gradient-to-b from-cyan-400/15 to-transparent"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-20 sm:px-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl flex-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100 shadow-glow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Real-Time Intelligent Threat Detection System
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="text-glow bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
              AI-Powered Threat Detection &amp; Response
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-slate-300 sm:text-xl"
          >
            Detect phishing, malware, DDoS attacks, suspicious logins, and network
            anomalies using continuously trained AI models and live graph analytics.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:brightness-110"
            >
              Start Monitoring
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-white/10"
            >
              <Play className="h-4 w-4 text-cyan-300" />
              View Dashboard
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400"
          >
            <div>
              <p className="text-2xl font-bold text-white">99.99%</p>
              <p>Ingest SLA (demo)</p>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" />
            <div>
              <p className="text-2xl font-bold text-emerald-300">&lt;20ms</p>
              <p>Inference p99</p>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" />
            <div>
              <p className="text-2xl font-bold text-purple-300">24/7</p>
              <p>Autonomous watch</p>
            </div>
          </motion.div>
        </div>

        <div className="relative flex flex-1 justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 90 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-cyan-500/30 via-transparent to-purple-500/30 blur-3xl" />
            <div className="glass neon-border relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">LIVE_SCAN :: edge-fleet</span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  ACTIVE
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {(
                  [
                    ["TLS inspection", "93.2"],
                    ["Memory patterns", "90.8"],
                    ["Identity risk", "88.1"],
                    ["Cloud control", "95.4"],
                  ] as const
                ).map(([row, pct], i) => (
                  <div
                    key={row}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2"
                  >
                    <span className="text-sm text-slate-200">{row}</span>
                    <motion.span
                      className="font-mono text-xs text-cyan-300"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {pct}%
                    </motion.span>
                  </div>
                ))}
              </div>
              <div className="mt-5 h-24 overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40">
                <motion.div
                  className="h-full w-full bg-[linear-gradient(110deg,transparent_40%,rgba(56,189,248,0.25)_50%,transparent_60%)] bg-[length:200%_100%]"
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                Simulated live scanning — for presentation only
              </p>
            </div>

            <motion.div
              className="absolute -left-6 top-10 hidden rounded-2xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs text-purple-100 shadow-glow-purple sm:block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              ML graph expansion
            </motion.div>
            <motion.div
              className="absolute -right-4 bottom-16 hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100 sm:block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              Zero-trust posture ↑
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
