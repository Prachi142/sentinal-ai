/**
 * Client-side audio heuristics for hackathon demos — not a certified deepfake detector.
 * Pair with optional backend via VITE_VOICE_DETECTION_API_URL.
 */

import type { FindingSeverity } from "./threatAnalysis";

export type VoiceFinding = {
  rule: string;
  severity: FindingSeverity;
  detail: string;
};

export type VoiceVerdict = "safe" | "suspicious" | "malicious";

export type VoiceLocalAnalysis = {
  verdict: VoiceVerdict;
  aiVoiceProbability: number;
  fraudCallProbability: number;
  findings: VoiceFinding[];
  summary: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
};

const SEV: Record<FindingSeverity, number> = {
  info: 2,
  low: 5,
  medium: 12,
  high: 22,
  critical: 38,
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function verdictFrom(score: number): VoiceVerdict {
  if (score >= 68) return "malicious";
  if (score >= 36) return "suspicious";
  return "safe";
}

export async function decodeAudioToBuffer(file: File): Promise<AudioBuffer> {
  const ctx = new AudioContext();
  const ab = await file.arrayBuffer();
  try {
    return await ctx.decodeAudioData(ab.slice(0));
  } finally {
    await ctx.close().catch(() => {});
  }
}

/**
 * Lightweight frame-based statistics on channel 0.
 */
export function analyzeAudioBuffer(buffer: AudioBuffer): VoiceLocalAnalysis {
  const findings: VoiceFinding[] = [];
  const ch0 = buffer.getChannelData(0);
  const len = ch0.length;
  const durationSec = len / buffer.sampleRate;
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;

  if (durationSec < 0.35) {
    findings.push({
      rule: "Extremely short clip",
      severity: "high",
      detail: "Under ~0.35s — insufficient for human prosody; common in IVR test tones or broken captures.",
    });
  } else if (durationSec < 1.2) {
    findings.push({
      rule: "Short utterance",
      severity: "medium",
      detail: "Very short — many fraud bots use clipped prompts; request longer hold for analyst review.",
    });
  }

  if (sampleRate === 8000) {
    findings.push({
      rule: "Narrowband telephony rate",
      severity: "low",
      detail: "8 kHz — typical PSTN; spectral detail limited; raises spoofing detection difficulty.",
    });
  }

  const frame = Math.max(512, Math.floor(sampleRate / 50));
  let silentFrames = 0;
  let totalFrames = 0;
  const rmsList: number[] = [];
  let clipCount = 0;
  let zc = 0;

  for (let i = 0; i < len; i++) {
    if (Math.abs(ch0[i]) >= 0.998) clipCount++;
  }
  const clipRatio = clipCount / Math.max(1, len);
  if (clipRatio > 0.02) {
    findings.push({
      rule: "Heavy clipping / limiting",
      severity: "high",
      detail: `${(clipRatio * 100).toFixed(2)}% samples near full scale — aggressive compression or cheap spoof pipeline.`,
    });
  } else if (clipRatio > 0.005) {
    findings.push({
      rule: "Moderate clipping",
      severity: "medium",
      detail: "Possible over-driven mic or normalized scam robocall chain.",
    });
  }

  for (let off = 0; off + frame < len; off += frame) {
    totalFrames++;
    let sum = 0;
    for (let j = 0; j < frame; j++) {
      const s = ch0[off + j];
      sum += s * s;
    }
    const rms = Math.sqrt(sum / frame);
    rmsList.push(rms);
    if (rms < 0.012) silentFrames++;
    for (let j = 1; j < frame; j++) {
      const a = ch0[off + j - 1];
      const b = ch0[off + j];
      if ((a >= 0 && b < 0) || (a < 0 && b >= 0)) zc++;
    }
  }

  const silenceRatio = totalFrames ? silentFrames / totalFrames : 0;
  if (silenceRatio > 0.55) {
    findings.push({
      rule: "High silence ratio",
      severity: "high",
      detail: `${(silenceRatio * 100).toFixed(0)}% of windows are near-silent — padding, dead air, or stitched scam loop.`,
    });
  } else if (silenceRatio > 0.35) {
    findings.push({
      rule: "Elevated silence",
      severity: "medium",
      detail: "Unusual amount of quiet segments vs natural conversation.",
    });
  }

  if (rmsList.length >= 4) {
    const mean = rmsList.reduce((a, b) => a + b, 0) / rmsList.length;
    const varR =
      rmsList.reduce((a, b) => a + (b - mean) * (b - mean), 0) / rmsList.length;
    const cv = mean > 1e-6 ? Math.sqrt(varR) / mean : 0;
    if (cv < 0.35 && durationSec > 2) {
      findings.push({
        rule: "Low energy modulation",
        severity: "medium",
        detail: "Frame RMS varies little over time — can indicate flat TTS / looped robocall bed (heuristic only).",
      });
    }
    if (cv > 2.8) {
      findings.push({
        rule: "Erratic energy swings",
        severity: "low",
        detail: "Large RMS jumps — could be spliced IVR, hold music cuts, or aggressive VAD.",
      });
    }
  }

  const zcPerSec = durationSec > 0 ? zc / durationSec / sampleRate : 0;
  if (zcPerSec > 0.45 && durationSec > 1.5) {
    findings.push({
      rule: "High zero-crossing density",
      severity: "low",
      detail: "Noisy or breathy content — not decisive alone; combine with ASR + script risk.",
    });
  }

  let score = 10;
  for (const f of findings) score += SEV[f.severity];
  score = clamp(score, 0, 100);
  const verdict = verdictFrom(score);

  const aiVoiceProbability = clamp(Math.round(score * 0.72 + clipRatio * 500), 0, 99);
  const fraudCallProbability = clamp(
    Math.round(score * 0.65 + silenceRatio * 40),
    0,
    99
  );

  const summary =
    verdict === "safe"
      ? "Few acoustic abuse markers in this clip — still run ASR + policy checks for scam scripts."
      : verdict === "suspicious"
        ? "Multiple telephony / synthetic-signal heuristics fired — escalate if transcript matches fraud playbooks."
        : "Strong alignment with robocall / over-processed audio heuristics — treat as high-risk until disproven.";

  return {
    verdict,
    aiVoiceProbability,
    fraudCallProbability,
    findings,
    summary,
    durationSec,
    sampleRate,
    channels,
  };
}

export type VoiceApiResult =
  | {
      used: true;
      ok: boolean;
      status: number;
      json?: Record<string, unknown>;
      text?: string;
      error?: string;
    }
  | { used: false; message: string };

/**
 * (B) Stub / forwarder — point VITE_VOICE_DETECTION_API_URL at your future service.
 * Expected optional shape: POST multipart field "audio" → JSON { score, label, ... }
 */
export async function fetchVoiceDetectionApi(file: File): Promise<VoiceApiResult> {
  const base = (import.meta.env.VITE_VOICE_DETECTION_API_URL as string | undefined)?.trim();
  if (!base) {
    return {
      used: false,
      message:
        "Cloud voice API not configured. Create a .env file with VITE_VOICE_DETECTION_API_URL=https://your-api.example.com and restart Vite.",
    };
  }

  const url = `${base.replace(/\/$/, "")}/analyze`;
  const token = (import.meta.env.VITE_VOICE_API_KEY as string | undefined)?.trim();

  const fd = new FormData();
  fd.append("audio", file, file.name || "clip.webm");

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 12_000);

  try {
    const res = await fetch(url, { method: "POST", body: fd, headers, signal: ctrl.signal });
    const ct = res.headers.get("content-type") ?? "";
    let json: Record<string, unknown> | undefined;
    let text: string | undefined;
    if (ct.includes("application/json")) {
      try {
        json = (await res.json()) as Record<string, unknown>;
      } catch {
        text = await res.text();
      }
    } else {
      text = await res.text();
    }
    return {
      used: true,
      ok: res.ok,
      status: res.status,
      json,
      text,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed";
    return { used: true, ok: false, status: 0, error: msg };
  } finally {
    window.clearTimeout(t);
  }
}
