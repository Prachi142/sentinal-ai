import { useMemo, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Link2,
  ScrollText,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Zap,
  BookOpen,
  Radio,
} from "lucide-react";
import {
  analyzeUrl,
  analyzeFileArtifact,
  analyzeLogs,
  type AnalysisResult,
} from "../lib/threatAnalysis";

type Tab = "file" | "url" | "logs";

const SAMPLES: Record<Tab, { label: string; value: string }[]> = {
  url: [
    { label: "Phishing-style", value: "http://secure-login-update.tk/verify/account?redirect=https://evil" },
    { label: "Safer corporate", value: "https://portal.company.example/dashboard" },
    { label: "Deep + keywords", value: "https://a.b.c.d.evil.xyz/auth/signin-validate?next=/stolen" },
  ],
  file: [
    { label: "Double extension", value: "invoice.pdf.exe" },
    { label: "SHA-256", value: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" },
    { label: "Script drop", value: "C:\\Users\\Public\\update.ps1" },
  ],
  logs: [
    {
      label: "Brute-force burst",
      value: `Jan 14 10:01:01 host sshd[4411]: Failed password for root from 203.0.113.44 port 22 ssh2
Jan 14 10:01:02 host sshd[4412]: Failed password for root from 203.0.113.44 port 22 ssh2
Jan 14 10:01:03 host sshd[4413]: Failed password for invalid user admin from 203.0.113.44 port 22 ssh2
Jan 14 10:01:04 host sshd[4414]: Failed password for invalid user admin from 198.51.100.9 port 22 ssh2`,
    },
    {
      label: "Routine",
      value: "Jan 14 09:00:01 host CRON[1200]: (user) CMD (/usr/local/bin/backup.sh)",
    },
  ],
};

const PIPELINE_STEPS = [
  "Normalizing artifact …",
  "TLS & transport signals …",
  "Heuristic ruleset v3.2 …",
  "Behavioral baseline compare …",
  "Ensemble scoring …",
];

function severityDot(sev: string) {
  const map: Record<string, string> = {
    critical: "bg-rose-500 shadow-[0_0_10px_#f43f5e]",
    high: "bg-orange-400",
    medium: "bg-amber-400",
    low: "bg-cyan-400",
    info: "bg-slate-500",
  };
  return map[sev] ?? "bg-slate-500";
}

export function AIAnalysis() {
  const [tab, setTab] = useState<Tab>("url");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipelineIdx, setPipelineIdx] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [fileMeta, setFileMeta] = useState<{ name?: string; size?: number }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const placeholder = useMemo(() => {
    if (tab === "file") return "Filename, path, or hex hash (MD5 / SHA-1 / SHA-256)";
    if (tab === "url") return "https://example.com/suspicious/path";
    return "Paste syslog, auth.log, or VPN / IdP lines (multi-line)…";
  }, [tab]);

  const livePreview = useMemo(() => {
    if (tab === "url" && input.trim().length > 6) {
      try {
        const r = analyzeUrl(input);
        return { n: r.findings.length, verdict: r.verdict, prob: r.threatProbability };
      } catch {
        return null;
      }
    }
    if (tab === "logs" && input.trim().length > 20) {
      const r = analyzeLogs(input);
      return { n: r.findings.length, verdict: r.verdict, prob: r.threatProbability };
    }
    return null;
  }, [tab, input]);

  async function runAnalysis() {
    setLoading(true);
    setResult(null);
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipelineIdx(i);
      await new Promise((r) => setTimeout(r, 380));
    }
    let out: AnalysisResult;
    if (tab === "url") out = analyzeUrl(input);
    else if (tab === "file") out = analyzeFileArtifact(input, fileMeta);
    else out = analyzeLogs(input);
    setResult(out);
    setLoading(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void runAnalysis();
  }

  function applySample(value: string) {
    setInput(value);
    setResult(null);
  }

  function onPickFile(f: File | null) {
    if (!f) {
      setFileMeta({});
      return;
    }
    setFileMeta({ name: f.name, size: f.size });
    setInput((prev) => (prev.trim() ? prev : f.name));
  }

  return (
    <section id="analysis" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-purple-300/90">
            AI Analysis Panel
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Interactive threat scoring — tuned to your input
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Paste a real URL, log excerpt, or file descriptor. Sentinel runs a transparent
            heuristic pipeline in your browser and explains every signal (demo — not a
            replacement for enterprise TI or sandboxing).
          </p>
        </div>

        <motion.div
          layout
          className="mb-8 overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-950/50 ring-1 ring-white/10"
        >
          <button
            type="button"
            onClick={() => setGuideOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              How to use this panel
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-slate-400 transition ${guideOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {guideOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10 px-4 pb-4 pt-0 sm:px-5"
              >
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
                  <li>Choose <strong className="text-white">URL</strong>, <strong className="text-white">File</strong>, or <strong className="text-white">Logs</strong>.</li>
                  <li>
                    Try a <strong className="text-white">sample</strong> chip below the form, or paste your own data.
                  </li>
                  <li>
                    Press <strong className="text-white">Run AI analysis</strong> — watch the live pipeline, then read
                    signals and the recommended action.
                  </li>
                  <li>
                    Open the floating <strong className="text-white">assistant</strong> — paste a URL there too; it uses
                    the same engine.
                  </li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div layout className="glass neon-border rounded-2xl p-6 lg:col-span-3">
            <div className="flex flex-wrap gap-2 rounded-xl bg-slate-950/60 p-1 ring-1 ring-white/10">
              {(
                [
                  ["url", Link2, "Phishing URL"],
                  ["file", FileUp, "Suspicious file"],
                  ["logs", ScrollText, "Login logs"],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTab(key);
                    setResult(null);
                    setInput("");
                    setFileMeta({});
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

            {livePreview && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-100/95">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                <span>
                  Live heuristic preview: <strong>{livePreview.n}</strong> signal(s) · verdict{" "}
                  <strong className="uppercase">{livePreview.verdict}</strong> · est.{" "}
                  <strong>{livePreview.prob}%</strong>
                </span>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                {tab === "file" && "Artifact (upload optional + describe)"}
                {tab === "url" && "Target URL"}
                {tab === "logs" && "Raw logs"}
              </label>

              {tab === "file" ? (
                <div className="space-y-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                    onClick={() => fileRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/35 bg-slate-950/50 py-10 text-center transition hover:border-cyan-400/55 hover:bg-slate-900/40"
                  >
                    <FileUp className="h-10 w-10 text-cyan-400" />
                    <p className="mt-3 text-sm text-slate-400">
                      Click to pick a file (name & size are analyzed locally)
                    </p>
                    {fileMeta.name && (
                      <p className="mt-2 font-mono text-xs text-cyan-200">
                        {fileMeta.name}
                        {fileMeta.size != null ? ` · ${(fileMeta.size / 1024).toFixed(1)} KB` : ""}
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 font-mono text-sm outline-none ring-cyan-500/40 focus:ring-2"
                    placeholder={placeholder}
                  />
                </div>
              ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={tab === "logs" ? 10 : 4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm leading-relaxed outline-none ring-cyan-500/30 focus:ring-2"
                  placeholder={placeholder}
                />
              )}

              <div className="flex flex-wrap gap-2">
                <span className="w-full text-xs font-medium uppercase tracking-wide text-slate-500">
                  Try a sample
                </span>
                {SAMPLES[tab].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => applySample(s.value)}
                    className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500/40 hover:text-white"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Running pipeline…
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
              Engine output
            </h3>

            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-3 text-sm text-slate-400"
                >
                  <p>Run an analysis to see verdict, numeric scores, per-rule findings, and response guidance.</p>
                  <p className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-500">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    Scores update from your exact text — same input always yields the same structured result for demos.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="load"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-cyan-400/90">
                    Real-time detection pipeline
                  </p>
                  <ul className="space-y-2">
                    {PIPELINE_STEPS.map((label, i) => (
                      <li
                        key={label}
                        className={`flex items-center gap-2 text-sm ${
                          i <= pipelineIdx ? "text-cyan-100" : "text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            i < pipelineIdx
                              ? "bg-emerald-400"
                              : i === pipelineIdx
                                ? "animate-pulse bg-cyan-400"
                                : "bg-slate-700"
                          }`}
                        />
                        {label}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="res"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${
                      result.verdict === "malicious"
                        ? "bg-rose-500/20 text-rose-200 ring-rose-500/40"
                        : result.verdict === "suspicious"
                          ? "bg-amber-500/15 text-amber-100 ring-amber-500/35"
                          : "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
                    }`}
                  >
                    {result.verdict}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-950/60 p-3 ring-1 ring-white/10">
                      <p className="text-[10px] uppercase text-slate-500">Threat probability</p>
                      <p className="text-xl font-bold text-cyan-300">{result.threatProbability}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-3 ring-1 ring-white/10">
                      <p className="text-[10px] uppercase text-slate-500">Risk score</p>
                      <p className="text-xl font-bold text-purple-300">{result.riskScore}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-slate-500">Classification</p>
                    <p className="font-medium text-white">{result.threatType}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-300">{result.summary}</p>

                  {result.findings.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Explainable signals
                      </p>
                      <ul className="max-h-48 space-y-2 overflow-y-auto pr-1 text-xs">
                        {result.findings.map((f, i) => (
                          <li
                            key={`${f.rule}-${i}`}
                            className="flex gap-2 rounded-lg border border-white/5 bg-slate-900/50 px-2 py-2"
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot(f.severity)}`}
                            />
                            <div>
                              <p className="font-medium text-slate-200">{f.rule}</p>
                              <p className="text-slate-400">{f.detail}</p>
                              <p className="mt-0.5 text-[10px] uppercase text-slate-600">{f.severity}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
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
