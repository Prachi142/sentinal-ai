import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";

const canned = [
  "I correlated 3 IOCs with your last hour of DNS logs — no active breach.",
  "Elevated risk on endpoint FIN-042: recommend isolating until disk scan completes.",
  "Phishing campaign cluster PR-77 detected — 214 similar URLs sinkholed.",
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Sentinel Assistant online. Ask about threats, playbooks, or posture." },
  ]);
  const [draft, setDraft] = useState("");

  function send() {
    const t = draft.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setDraft("");
    window.setTimeout(() => {
      const reply = canned[(Math.random() * canned.length) | 0];
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 600);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 shadow-glow-purple transition hover:scale-105 md:bottom-8 md:right-8"
        aria-label="Open assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-24 right-4 z-50 flex w-[min(100%,380px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-purple-500/20 backdrop-blur-xl md:right-8"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Sentinel Assistant</p>
                  <p className="text-xs text-slate-500">Demo · not connected to a backend</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={`${i}-${m.text.slice(0, 12)}`}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      m.role === "user"
                        ? "bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-500/30"
                        : "bg-slate-800/80 text-slate-200 ring-1 ring-white/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about an alert…"
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none ring-cyan-500/30 focus:ring-2"
              />
              <button
                type="button"
                onClick={send}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-slate-950"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
