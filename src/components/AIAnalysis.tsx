import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Link2,
  ScrollText,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

type Tab = "file" | "url" | "logs";

function fakeAnalyze(kind: Tab, payload: string) {
  const hash = [...payload].reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
  const prob = Math.min(99, 35 + hash);
  const types: Record<Tab, string[]> = {
    file: ["Trojanized dropper", "Packed binary", "Benign with risky imports"],
    url: ["Credential phishing", "Open redirect chain", "Benign marketing LP"],
    logs: ["Impossible travel", "Credential stuffing", "Routine admin activity"],
  };
  const actions = [
    "Quarantine endpoint & revoke tokens",
    "Sinkhole domain & notify users",
    "Require MFA step-up & alert SOC",
    "No action — monitor baseline",
  ];
  const idx = hash % types[kind].length;
  return {
    threatProbability: prob,
    riskScore: Math.round(prob * 0.85 + (hash % 12)),
    threatType: types[kind][idx],
    action: actions[idx % actions.length],
  };
}

export function AIAnalysis() {
  const [tab, setTab] = useState<Tab>("url");
  const [input, setInput] = useState("https://login-secure-update.example.co/auth");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof fakeAnalyze> | null>(null);

  const placeholder = useMemo(() => {
    if (tab === "file") return "Drop path or paste file hash (demo)";
    if (tab === "url") return "https://suspicious.example/login";
    return "Paste syslog / auth lines…";
  }, [tab]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(fakeAnalyze(tab, input || "x"));
      setLoading(false);
    }, 900);
  }

  return (
    <section id="analysis" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-300/90">
            AI Analysis Panel
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Analyze files, URLs, and identity signals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Prototype interface—submit sample inputs to simulate model scoring and
            recommended containment steps.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            layout
            className="glass neon-border rounded-2xl p-6 lg:col-span-3"
          >
            <div className="flex flex-wrap gap-2 rounded-xl bg-slate-950/60 p-1 ring-1 ring-white/10">
              {(
                [
                  ["file", FileUp, "Suspicious file"],
                  ["url", Link2, "Phishing URL"],
                  ["logs", ScrollText, "Login logs"],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTab(key);
                    setResult(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    tab === key
                      ? "bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-white shadow-glow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                {tab === "file" && "Upload or describe artifact"}
                {tab === "url" && "Target URL"}
                {tab === "logs" && "Raw logs"}
              </label>
              {tab === "file" ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/35 bg-slate-950/50 py-12 text-center">
                  <FileUp className="h-10 w-10 text-cyan-400" />
                  <p className="mt-3 text-sm text-slate-400">
                    Drag & drop (demo) — or type a hash / filename below
                  </p>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-4 w-full max-w-md rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 font-mono text-sm outline-none ring-cyan-500/40 focus:ring-2"
                    placeholder={placeholder}
                  />
                </div>
              ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={tab === "logs" ? 8 : 3}
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm outline-none ring-cyan-500/30 focus:ring-2"
                  placeholder={placeholder}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Running inference…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI analysis
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <div className="glass rounded-2xl border border-emerald-500/15 p-6 lg:col-span-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <ShieldAlert className="h-5 w-5 text-emerald-400" />
              Model output
            </h3>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-sm text-slate-400"
                >
                  Submit an artifact to generate a simulated threat assessment with
                  probability, composite risk, classification, and response guidance.
                </motion.p>
              )}
              {loading && (
                <motion.div
                  key="load"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-3"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded-full bg-slate-700/80"
                      style={{ width: `${90 - i * 12}%` }}
                    />
                  ))}
                </motion.div>
              )}
              {result && (
                <motion.div
                  key="res"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                      <p className="text-xs uppercase text-slate-500">Threat probability</p>
                      <p className="mt-1 text-2xl font-bold text-cyan-300">
                        {result.threatProbability}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                      <p className="text-xs uppercase text-slate-500">Risk score</p>
                      <p className="mt-1 text-2xl font-bold text-purple-300">
                        {result.riskScore}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Threat type</p>
                    <p className="mt-1 font-medium text-white">{result.threatType}</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-200">Recommended action</p>
                      <p className="text-emerald-100/90">{result.action}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
