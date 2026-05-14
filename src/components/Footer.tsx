import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { teamMembers } from "../data/dummyData";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-slate-950/80 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">Sentinel AI</p>
            <p className="mt-2 text-sm text-slate-400">
              Prototype SOC experience blending AI detection, rich telemetry, and analyst
              workflows for your hackathon storyboard.
            </p>
            <a
              href="mailto:support@sentinel-ai.demo"
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
            >
              <Mail className="h-4 w-4" />
              support@sentinel-ai.demo
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Team
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {teamMembers.map((m) => (
                <li key={m.name}>
                  <span className="font-medium text-white">{m.name}</span>
                  <span className="text-slate-500"> — {m.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Repository
            </p>
            <a
              href="https://github.com/Prachi142/sentinal-ai"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyan-500/40 hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
              github.com/Prachi142/sentinal-ai
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Social
            </p>
            <div className="mt-3 flex gap-3">
              {[
                { Icon: Twitter, href: "https://twitter.com/" },
                { Icon: Linkedin, href: "https://linkedin.com/" },
                { Icon: Github, href: "https://github.com/" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Sentinel AI — Prachi, Priya, Shreya. Hackathon demo.</p>
          <p>UI-only prototype — no production telemetry is collected.</p>
        </div>
      </div>
    </footer>
  );
}
