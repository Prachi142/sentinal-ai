import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ROWS = 10;
const COLS = 18;

export function ThreatHeatmap() {
  const [cells, setCells] = useState(() =>
    Array.from({ length: ROWS * COLS }, () => Math.random())
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setCells((prev) =>
        prev.map((v, i) => {
          const n = (Math.sin(i + Date.now() / 400) + 1) / 2;
          return Math.min(1, v * 0.85 + n * 0.25);
        })
      );
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-2xl border border-cyan-500/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Threat heatmap</p>
        <span className="text-xs text-slate-500">subnet activity (simulated)</span>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
      >
        {cells.map((intensity, i) => {
          const hue = 190 + intensity * 80;
          return (
            <motion.div
              key={i}
              className="aspect-square rounded-sm"
              animate={{
                backgroundColor: `hsla(${hue}, 85%, ${45 + intensity * 25}%, ${0.35 + intensity * 0.55})`,
                boxShadow:
                  intensity > 0.75
                    ? `0 0 12px hsla(${hue}, 100%, 60%, 0.45)`
                    : "0 0 0 transparent",
              }}
              transition={{ duration: 0.4 }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span>low</span>
        <div className="mx-3 h-1 flex-1 rounded-full bg-gradient-to-r from-slate-800 via-cyan-500 to-rose-500" />
        <span>critical</span>
      </div>
    </div>
  );
}
