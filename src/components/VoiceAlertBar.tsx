import { useEffect, useState } from "react";
import { Mic, Volume2 } from "lucide-react";

export function VoiceAlertBar() {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLevel(Math.random());
    }, 220);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl border border-purple-500/25 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 ring-1 ring-purple-400/40">
          <Mic className="h-5 w-5 text-purple-200" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Voice alert channel</p>
          <p className="text-xs text-slate-400">
            Hands-free SOC playback for critical incidents (UI prototype)
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
        <Volume2 className="h-4 w-4 text-cyan-400" />
        <div className="flex h-8 flex-1 items-end gap-0.5">
          {Array.from({ length: 24 }).map((_, i) => {
            const h = 4 + ((Math.sin(i / 2 + level * 6) + 1) / 2) * 22 * level;
            return (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-cyan-600 to-purple-400 transition-[height]"
                style={{ height: `${h}px`, opacity: 0.35 + level * 0.55 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
