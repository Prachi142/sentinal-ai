import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Upload,
  Radio,
  Cloud,
  Loader2,
  Shield,
  FileAudio,
} from "lucide-react";
import {
  analyzeAudioBuffer,
  decodeAudioToBuffer,
  fetchVoiceDetectionApi,
  type VoiceApiResult,
  type VoiceLocalAnalysis,
} from "../lib/voiceFraudAnalysis";

const PIPELINE = [
  "Decoding waveform …",
  "Frame RMS & silence profile …",
  "Clipping & zero-crossing scan …",
  "Synthetic / robocall heuristics …",
  "Scoring ensemble …",
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

export function VoiceFraudLab() {
  const [file, setFile] = useState<File | null>(null);
  const [local, setLocal] = useState<VoiceLocalAnalysis | null>(null);
  const [apiResult, setApiResult] = useState<VoiceApiResult | null>(null);
  const [busyLocal, setBusyLocal] = useState(false);
  const [busyApi, setBusyApi] = useState(false);
  const [pipeIdx, setPipeIdx] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = useCallback((f: File | null) => {
    setFile(f);
    setLocal(null);
    setApiResult(null);
    setErr(null);
  }, []);

  async function runLocal() {
    if (!file) {
      setErr("Choose or record an audio file first (WAV, MP3, WebM, …).");
      return;
    }
    setErr(null);
    setBusyLocal(true);
    setLocal(null);
    setPipeIdx(0);
    try {
      for (let i = 0; i < PIPELINE.length; i++) {
        setPipeIdx(i);
        await new Promise((r) => setTimeout(r, 280));
      }
      const buf = await decodeAudioToBuffer(file);
      setLocal(analyzeAudioBuffer(buf));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not decode audio in this browser.");
    } finally {
      setBusyLocal(false);
    }
  }

  async function runCloud() {
    if (!file) {
      setErr("Select audio before calling the cloud API.");
      return;
    }
    setBusyApi(true);
    setApiResult(null);
    setErr(null);
    try {
      const r = await fetchVoiceDetectionApi(file);
      setApiResult(r);
    } finally {
      setBusyApi(false);
    }
  }

  async function toggleRecord() {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        const f = new File([blob], `sentinel-capture-${Date.now()}.webm`, { type: mime });
        setFile(f);
        setLocal(null);
        setApiResult(null);
        recRef.current = null;
      };
      recRef.current = rec;
      rec.start(200);
      setRecording(true);
    } catch {
      setErr("Microphone permission denied or not available.");
    }
  }

  return (
    <section id="voice-fraud" className="relative border-t border-white/5 py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fuchsia-500/6 via-transparent to-cyan-500/6" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-fuchsia-300/90">
            Voice fraud lab
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            AI / robocall audio screening
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            <strong className="text-slate-300">(A)</strong> Upload or record a clip — Sentinel runs{" "}
            <strong className="text-cyan-300">local acoustic heuristics</strong> (silence, clipping,
            energy flatness). <strong className="text-slate-300">(B)</strong> Optionally forward the
            same file to <strong className="text-purple-300">your backend</strong> via{" "}
            <code className="rounded bg-slate-900 px-1 text-xs text-purple-200">
              VITE_VOICE_DETECTION_API_URL
            </code>{" "}
            → <code className="rounded bg-slate-900 px-1 text-xs">POST …/analyze</code> with field{" "}
            <code className="text-xs text-emerald-300">audio</code>.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            layout
            className="glass neon-border rounded-2xl border border-fuchsia-500/20 p-6"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FileAudio className="h-5 w-5 text-fuchsia-400" />
              Input
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Browser-only decode — nothing is uploaded unless you press “Cloud API”.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.aac"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
              >
                <Upload className="h-4 w-4" />
                Upload recording
              </button>
              <button
                type="button"
                onClick={() => void toggleRecord()}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  recording
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-100"
                    : "border-purple-500/35 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20"
                }`}
              >
                {recording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop &amp; attach
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Record from mic
                  </>
                )}
              </button>
            </div>

            {file && (
              <p className="mt-4 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-300">
                {file.name} · {(file.size / 1024).toFixed(1)} KB
              </p>
            )}

            {err && (
              <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {err}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={busyLocal || !file}
                onClick={() => void runLocal()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-glow disabled:opacity-45"
              >
                {busyLocal ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" />
                    Run local detection
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={busyApi || !file}
                onClick={() => void runCloud()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/15 px-4 py-3 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/25 disabled:opacity-45"
              >
                {busyApi ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calling API…
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4" />
                    Send to cloud API
                  </>
                )}
              </button>
            </div>

            {busyLocal && (
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400/90">
                  Real-time pipeline
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                  {PIPELINE.map((step, i) => (
                    <li key={step} className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          i < pipeIdx
                            ? "bg-emerald-400"
                            : i === pipeIdx
                              ? "animate-pulse bg-cyan-400"
                              : "bg-slate-700"
                        }`}
                      />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {local && (
                <motion.div
                  key="local"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-2xl border border-emerald-500/20 p-6"
                >
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Local engine result
                  </h3>
                  <div
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${
                      local.verdict === "malicious"
                        ? "bg-rose-500/20 text-rose-200 ring-rose-500/40"
                        : local.verdict === "suspicious"
                          ? "bg-amber-500/15 text-amber-100 ring-amber-500/35"
                          : "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
                    }`}
                  >
                    {local.verdict}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-950/60 p-3 ring-1 ring-white/10">
                      <p className="text-[10px] uppercase text-slate-500">AI / synthetic voice est.</p>
                      <p className="text-xl font-bold text-fuchsia-300">{local.aiVoiceProbability}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-950/60 p-3 ring-1 ring-white/10">
                      <p className="text-[10px] uppercase text-slate-500">Fraud-call risk est.</p>
                      <p className="text-xl font-bold text-orange-300">{local.fraudCallProbability}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {local.durationSec.toFixed(2)}s · {local.sampleRate} Hz · {local.channels} ch
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{local.summary}</p>
                  <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-xs">
                    {local.findings.map((f, i) => (
                      <li
                        key={`${f.rule}-${i}`}
                        className="flex gap-2 rounded-lg border border-white/5 bg-slate-900/40 px-2 py-2"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot(f.severity)}`} />
                        <div>
                          <p className="font-medium text-slate-200">{f.rule}</p>
                          <p className="text-slate-500">{f.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass rounded-2xl border border-purple-500/25 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Cloud className="h-5 w-5 text-purple-300" />
                Cloud API (optional)
              </h3>
              {!apiResult && (
                <p className="mt-3 text-sm text-slate-400">
                  Configure your server, then merge JSON into dashboards. Until then, the button
                  above still runs and shows the response or configuration hint here.
                </p>
              )}
              {apiResult && !apiResult.used && (
                <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  {apiResult.message}
                </p>
              )}
              {apiResult && apiResult.used && (
                <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-slate-950/60 p-3 font-mono text-xs text-slate-300">
                  <p>
                    <span className="text-slate-500">status:</span> {apiResult.status}{" "}
                    {apiResult.ok ? "OK" : apiResult.error ?? "error"}
                  </p>
                  {apiResult.json && (
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[11px]">
                      {JSON.stringify(apiResult.json, null, 2)}
                    </pre>
                  )}
                  {apiResult.text && !apiResult.json && (
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px]">
                      {apiResult.text}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-950/80 px-6 py-8 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Team</p>
          <p className="mt-3 text-xl font-semibold tracking-wide text-white sm:text-2xl">
            Prachi · Priya · Shreya
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Sentinel AI — voice fraud lab &amp; interactive threat prototype
          </p>
        </motion.div>
      </div>
    </section>
  );
}
