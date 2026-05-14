import { motion } from "framer-motion";
import {
  Activity,
  BellRing,
  Brain,
  Fingerprint,
  Globe,
  Link2,
  Radar,
  Shield,
} from "lucide-react";

const features = [
  {
    title: "Real-Time Threat Monitoring",
    desc: "Sub-second correlation across endpoints, identities, and cloud workloads.",
    icon: Activity,
    accent: "from-cyan-500/30 to-blue-600/10",
  },
  {
    title: "AI-Based Malware Detection",
    desc: "Static + dynamic analysis with transformer-assisted feature extraction.",
    icon: Brain,
    accent: "from-purple-500/30 to-fuchsia-600/10",
  },
  {
    title: "Suspicious Login Detection",
    desc: "Impossible travel, token anomalies, and brute-force clustering.",
    icon: Fingerprint,
    accent: "from-emerald-500/25 to-cyan-500/10",
  },
  {
    title: "Network Traffic Analysis",
    desc: "Netflow enrichment, lateral movement graphs, and beaconing scores.",
    icon: Globe,
    accent: "from-sky-500/25 to-indigo-600/10",
  },
  {
    title: "Phishing URL Detection",
    desc: "Live URL intelligence with visual similarity and registrar reputation.",
    icon: Link2,
    accent: "from-rose-500/25 to-orange-500/10",
  },
  {
    title: "Automated Risk Scoring",
    desc: "Continuous risk posture with explainable drivers for every entity.",
    icon: Radar,
    accent: "from-amber-500/25 to-lime-500/10",
  },
  {
    title: "Live Alert Notifications",
    desc: "Multi-channel routing with severity-based escalation policies.",
    icon: BellRing,
    accent: "from-pink-500/25 to-purple-600/10",
  },
  {
    title: "Predictive Threat Intelligence",
    desc: "Forecast likely attack paths using graph neural nets on your telemetry.",
    icon: Shield,
    accent: "from-teal-500/25 to-emerald-600/10",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/90">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Built for modern attack surfaces
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Glassmorphism cards with neon edge lighting — hover to feel the depth of the
            control plane.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-lg shadow-black/40 backdrop-blur-xl"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-500 group-hover:opacity-100 ${f.accent}`}
              />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-slate-900/80 p-3 ring-1 ring-cyan-500/25 shadow-glow transition group-hover:shadow-glow-green">
                  <f.icon className="h-6 w-6 text-cyan-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
