import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  GitBranch,
  Layers,
  Radar,
  ShieldCheck,
} from "lucide-react";

const steps = [
  { title: "Ingest", desc: "Telemetry, logs, netflow, identity", icon: Layers },
  { title: "Feature ML", desc: "Embeddings + graph features", icon: Cpu },
  { title: "Detect", desc: "Anomaly + supervised ensembles", icon: Radar },
  { title: "Respond", desc: "SOAR playbooks & containment", icon: ShieldCheck },
];

export function AboutEngine() {
  return (
    <section id="about-engine" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/90">
            About the AI Engine
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Sentinel Core — enterprise-grade detection fabric
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            A layered stack combining classical security analytics with modern deep
            learning, behavioral baselines, and predictive risk scoring—similar in
            spirit to platforms you know from CrowdStrike, Darktrace, and Microsoft
            Defender.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass neon-border relative overflow-hidden rounded-2xl p-8"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
            <h3 className="relative text-xl font-semibold text-white">How it works</h3>
            <ul className="relative mt-6 space-y-4 text-slate-300">
              {[
                "Machine learning ensembles for malware & phishing classifiers",
                "Pattern recognition across URLs, headers, and file entropy",
                "Behavioral analysis with per-entity risk timelines",
                "Threat prediction using sequence models on login & network trails",
                "Unsupervised anomaly detection for zero-day style deviations",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="glass rounded-2xl border border-purple-500/20 p-8"
          >
            <h3 className="text-xl font-semibold text-white">Processing pipeline</h3>
            <div className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-white/10">
                      <s.icon className="h-6 w-6 text-cyan-300" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mt-2 h-10 w-px bg-gradient-to-b from-cyan-500/40 to-transparent" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{s.title}</p>
                    <p className="text-sm text-slate-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <Activity className="h-4 w-4 animate-pulse" />
              Live model drift monitoring active — auto-retraining window 6h
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 grid gap-6 sm:grid-cols-3"
        >
          {[
            { label: "Inference p99", value: "18 ms", color: "text-cyan-300" },
            { label: "False positive rate", value: "0.12%", color: "text-emerald-300" },
            { label: "Coverage", value: "142+ vectors", color: "text-purple-300" },
          ].map((m) => (
            <div
              key={m.label}
              className="glass rounded-xl border border-white/10 p-6 text-center"
            >
              <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
              <p className="mt-1 text-sm text-slate-400">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
