import { useEffect, useState } from "react";
import { terminalSeeds } from "../data/dummyData";

function randomLine() {
  const base = terminalSeeds[(Math.random() * terminalSeeds.length) | 0];
  const suffix = ` [${(Math.random() * 200 + 20).toFixed(0)}ms]`;
  return base + suffix;
}

export function LiveTerminal() {
  const [lines, setLines] = useState<string[]>(() =>
    Array.from({ length: 8 }, (_, i) => terminalSeeds[i % terminalSeeds.length])
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setLines((prev) => [...prev.slice(-14), randomLine()]);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-2xl border border-emerald-500/20 p-4 font-mono text-xs text-emerald-100/90 shadow-[inset_0_0_40px_rgba(16,185,129,0.06)] sm:text-sm">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-emerald-400/80 sm:text-xs">
        <span>sentinel-edge :: live trace</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          streaming
        </span>
      </div>
      <div className="h-40 overflow-hidden rounded-lg bg-black/50 px-3 py-2 ring-1 ring-emerald-500/15">
        {lines.map((l, i) => (
          <div key={i} className="leading-relaxed text-emerald-200/85">
            <span className="text-emerald-500/70">{`>`}</span> {l}
          </div>
        ))}
      </div>
    </div>
  );
}
