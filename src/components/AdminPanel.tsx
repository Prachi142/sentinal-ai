import { motion } from "framer-motion";
import {
  Users,
  FileWarning,
  Plug,
  Server,
  Settings,
  History,
  Activity,
} from "lucide-react";

const users = [
  { name: "svc_api_reader", role: "Analyst", status: "Active" },
  { name: "jordan.lee", role: "Admin", status: "Active" },
  { name: "guest_audit", role: "Read-only", status: "Suspended" },
];

export function AdminPanel() {
  return (
    <section id="admin" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400/90">
            Admin Console
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Operations & governance
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Glassmorphism admin shell for user lifecycle, reporting, integrations, and
            platform health—aligned with enterprise SOC workflows.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass neon-border rounded-2xl p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users className="h-5 w-5 text-cyan-400" />
                User management
              </h3>
              <button
                type="button"
                className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-200 ring-1 ring-cyan-500/30"
              >
                Invite user
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Principal</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u.name} className="text-slate-200">
                      <td className="py-3 font-mono text-xs sm:text-sm">{u.name}</td>
                      <td className="py-3 text-slate-400">{u.role}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.status === "Active"
                              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                              : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="glass rounded-2xl border border-purple-500/20 p-6"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Activity className="h-5 w-5 text-purple-300" />
              System health
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { label: "Ingest pipeline", value: "99.98%", ok: true },
                { label: "Model serving", value: "Healthy", ok: true },
                { label: "Kafka lag", value: "12 ms", ok: true },
                { label: "Backup window", value: "02:00 UTC", ok: true },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 ring-1 ring-white/5"
                >
                  <span className="text-slate-400">{row.label}</span>
                  <span className={row.ok ? "text-emerald-300" : "text-rose-300"}>
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Threat reports",
              desc: "Export STIX / PDF summaries",
              icon: FileWarning,
            },
            {
              title: "Incident history",
              desc: "Immutable audit trail",
              icon: History,
            },
            {
              title: "API integrations",
              desc: "SIEM, ITSM, SOAR webhooks",
              icon: Plug,
            },
          ].map((card) => (
            <div
              key={card.title}
              className="glass rounded-2xl border border-white/10 p-6 transition hover:border-cyan-500/30 hover:shadow-glow"
            >
              <card.icon className="h-8 w-8 text-cyan-400" />
              <h4 className="mt-4 font-semibold text-white">{card.title}</h4>
              <p className="mt-1 text-sm text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 glass rounded-2xl border border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-300" />
              <div>
                <p className="font-semibold text-white">Settings</p>
                <p className="text-sm text-slate-400">
                  Data residency, retention, RBAC, API keys (prototype UI)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-mono text-slate-500">region: eu-west-1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
