/**
 * Client-side heuristic engine for demo / hackathon UX.
 * Not a substitute for real AV, TI feeds, or backend ML.
 */

export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export type Finding = {
  rule: string;
  severity: FindingSeverity;
  detail: string;
};

export type AnalysisVerdict = "safe" | "suspicious" | "malicious";

export type AnalysisResult = {
  threatProbability: number;
  riskScore: number;
  threatType: string;
  action: string;
  summary: string;
  findings: Finding[];
  verdict: AnalysisVerdict;
};

const SEV_WEIGHT: Record<FindingSeverity, number> = {
  info: 2,
  low: 6,
  medium: 12,
  high: 20,
  critical: 35,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function verdictFromScore(score: number): AnalysisVerdict {
  if (score >= 72) return "malicious";
  if (score >= 38) return "suspicious";
  return "safe";
}

function aggregateScore(findings: Finding[]): number {
  let s = 8;
  for (const f of findings) {
    s += SEV_WEIGHT[f.severity];
  }
  return clamp(Math.round(s), 0, 100);
}

function pickAction(verdict: AnalysisVerdict): string {
  if (verdict === "malicious") {
    return "Block at perimeter, revoke active sessions for affected users, open Sev-1 incident, and preserve artifacts for forensics.";
  }
  if (verdict === "suspicious") {
    return "Step-up MFA, isolate host from sensitive VLANs, capture PCAP / disk image, and assign to SOC tier-2 within 30 minutes.";
  }
  return "Continue monitoring with elevated logging; no immediate containment required.";
}

function pickThreatType(findings: Finding[], fallback: string): string {
  const crit = findings.filter((f) => f.severity === "critical" || f.severity === "high");
  if (crit.length) return crit[0].rule;
  return fallback;
}

/** --- URL --- */

const URL_KEYWORDS = [
  "secure",
  "verify",
  "validate",
  "update",
  "account",
  "signin",
  "sign-in",
  "wallet",
  "banking",
  "suspended",
  "locked",
  "recover",
  "auth-",
  "login-",
];

const RISKY_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".click", ".zip"];

export function analyzeUrl(raw: string): AnalysisResult {
  const findings: Finding[] = [];
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      threatProbability: 0,
      riskScore: 0,
      threatType: "No input",
      action: "Paste a full URL (including scheme) to analyze.",
      summary: "Empty URL field.",
      findings: [
        {
          rule: "Input validation",
          severity: "info",
          detail: "Provide a target such as https://example.com/path",
        },
      ],
      verdict: "safe",
    };
  }

  let urlStr = trimmed;
  if (!/^https?:\/\//i.test(urlStr)) {
    findings.push({
      rule: "Scheme inference",
      severity: "info",
      detail: "No scheme provided — analysis assumes https:// prefix.",
    });
    urlStr = "https://" + urlStr;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    findings.push({
      rule: "Malformed URL",
      severity: "medium",
      detail: "Could not parse structure; may be obfuscated or truncated.",
    });
    const score = aggregateScore(findings);
    return {
      threatProbability: score,
      riskScore: clamp(Math.round(score * 0.92), 0, 100),
      threatType: "Malformed / obfuscated URL",
      action: pickAction(verdictFromScore(score)),
      summary: "Parser failed — treat as suspicious until manually reviewed.",
      findings,
      verdict: verdictFromScore(score),
    };
  }

  const host = parsed.hostname.toLowerCase();
  const path = (parsed.pathname + parsed.search).toLowerCase();

  if (parsed.protocol === "http:") {
    findings.push({
      rule: "Cleartext transport",
      severity: "medium",
      detail: "HTTP exposes credentials and tokens to network observers.",
    });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
    findings.push({
      rule: "IP / non-standard host literal",
      severity: "high",
      detail: "Phishing and malware C2 often use raw IPs or unusual host forms.",
    });
  }

  const afterProto = urlStr.replace(/^https?:\/\//i, "");
  const atPos = afterProto.indexOf("@");
  if (atPos > 0) {
    const beforeAt = afterProto.slice(0, atPos);
    if (beforeAt.includes(".") && !beforeAt.includes(":")) {
      findings.push({
        rule: "Misleading userinfo before @",
        severity: "critical",
        detail:
          "Text before @ looks like a brand or domain while the real host differs — classic credential phishing.",
      });
    }
  }

  const hostParts = host.split(".");
  if (hostParts.length > 4) {
    findings.push({
      rule: "Deep subdomain chain",
      severity: "medium",
      detail: `${hostParts.length} labels — often used to mimic brand paths.`,
    });
  }

  if (host.startsWith("xn--")) {
    findings.push({
      rule: "Punycode hostname",
      severity: "high",
      detail: "Homograph / IDN abuse is common in credential phishing.",
    });
  }

  for (const tld of RISKY_TLDS) {
    if (host.endsWith(tld)) {
      findings.push({
        rule: "High-risk TLD",
        severity: "high",
        detail: `Domain ends with ${tld} — frequently abused for spam and phishing.`,
      });
      break;
    }
  }

  const matchedKw: string[] = [];
  for (const kw of URL_KEYWORDS) {
    if (host.includes(kw) || path.includes(kw)) matchedKw.push(kw);
  }
  if (matchedKw.length) {
    findings.push({
      rule: "Social-engineering lexicon",
      severity: matchedKw.length >= 3 ? "high" : "medium",
      detail: `Matched keyword(s): ${matchedKw.slice(0, 5).join(", ")}${matchedKw.length > 5 ? "…" : ""}`,
    });
  }

  if (path.length > 120) {
    findings.push({
      rule: "Overlong path / query",
      severity: "low",
      detail: "Unusually long paths can hide redirects or encoded payloads.",
    });
  }

  const redirParams = ["redirect=", "url=", "next=", "return=", "dest="];
  for (const p of redirParams) {
    if (parsed.search.toLowerCase().includes(p)) {
      findings.push({
        rule: "Open-redirect parameters",
        severity: "medium",
        detail: `Query contains ${p} — can chain to malicious landing pages.`,
      });
      break;
    }
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    findings.push({
      rule: "Non-standard port",
      severity: "medium",
      detail: `Port ${parsed.port} — atypical for consumer login flows.`,
    });
  }

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    findings.push({
      rule: "Dangerous pseudo-scheme",
      severity: "critical",
      detail: "Executable or data URLs should never be treated as benign navigation.",
    });
  }

  const score = aggregateScore(findings);
  const verdict = verdictFromScore(score);
  const threatProbability = clamp(score, 0, 99);
  const riskScore = clamp(Math.round(score * 0.88 + (host.length % 7)), 0, 100);

  const summary =
    verdict === "safe"
      ? "Few abuse signals; still verify sender and org policy before use."
      : verdict === "suspicious"
        ? "Multiple structural or lexical signals overlap with known phishing tactics."
        : "Strong alignment with high-risk URL patterns — assume hostile until disproven.";

  return {
    threatProbability,
    riskScore,
    threatType: pickThreatType(findings, "Benign web resource"),
      action: pickAction(verdict),
    summary,
    findings,
    verdict,
  };
}

/** --- File / hash --- */

const SUSP_EXT = /\.(exe|scr|bat|cmd|ps1|vbs|js|jar|dll|msi)(\.|$)/i;
const DOUBLE_EXT = /\.(jpg|jpeg|png|gif|pdf|docx?|zip)\.(exe|scr|bat|ps1|vbs|js)$/i;

export function analyzeFileArtifact(input: string, meta?: { name?: string; size?: number }): AnalysisResult {
  const findings: Finding[] = [];
  const text = input.trim();
  const name = (meta?.name ?? "").toLowerCase();
  const combined = `${text} ${name}`.trim();

  if (!combined) {
    return {
      threatProbability: 0,
      riskScore: 0,
      threatType: "No input",
      action: "Paste a SHA-256 / MD5 hash, filename, or use file picker.",
      summary: "No artifact to score.",
      findings: [
        {
          rule: "Input validation",
          severity: "info",
          detail: "Describe the file or drop it in the analysis zone.",
        },
      ],
      verdict: "safe",
    };
  }

  const hex = text.replace(/\s/g, "");
  if (/^[a-f0-9]{32}$/i.test(hex)) {
    findings.push({
      rule: "MD5 fingerprint",
      severity: "info",
      detail: "MD5-only matching is weak; prefer SHA-256 for collision resistance.",
    });
  }
  if (/^[a-f0-9]{40}$/i.test(hex)) {
    findings.push({
      rule: "SHA-1 fingerprint",
      severity: "info",
      detail: "SHA-1 deprecated for security guarantees; treat as legacy IOC format.",
    });
  }
  if (/^[a-f0-9]{64}$/i.test(hex)) {
    findings.push({
      rule: "SHA-256 fingerprint",
      severity: "info",
      detail: "Strong hash format — suitable for TI correlation (demo has no cloud lookup).",
    });
  }

  if (name && DOUBLE_EXT.test(name)) {
    findings.push({
      rule: "Double extension",
      severity: "critical",
      detail: "Executable masquerading as document/media — very common malware delivery.",
    });
  } else if (name && SUSP_EXT.test(name)) {
    findings.push({
      rule: "Executable type",
      severity: "medium",
      detail: "Binary or script extension — verify publisher and code signing.",
    });
  }

  if (meta?.size !== undefined) {
    if (meta.size > 80 * 1024 * 1024) {
      findings.push({
        rule: "Large payload",
        severity: "low",
        detail: `${(meta.size / (1024 * 1024)).toFixed(1)} MiB — uncommon for simple documents.`,
      });
    }
    if (meta.size < 64 && meta.size > 0 && SUSP_EXT.test(name)) {
      findings.push({
        rule: "Tiny executable",
        severity: "high",
        detail: "Very small binaries are often droppers or loaders.",
      });
    }
  }

  const lower = combined.toLowerCase();
  if (lower.includes("ransom") || lower.includes("encrypt") || lower.includes("lockbit")) {
    findings.push({
      rule: "Ransomware lexicon",
      severity: "high",
      detail: "Filename or notes match ransomware-like terminology.",
    });
  }

  const score = aggregateScore(findings);
  const verdict = verdictFromScore(score);

  return {
    threatProbability: clamp(score, 0, 99),
    riskScore: clamp(Math.round(score * 0.9), 0, 100),
    threatType: pickThreatType(findings, "Unknown binary / artifact"),
      action: pickAction(verdict),
    summary:
      verdict === "safe"
        ? "Limited local signals — enterprise verdicts require sandbox detonation and TI."
        : verdict === "suspicious"
          ? "Several file-oriented abuse indicators present; hold execution pending scan."
          : "High-confidence local heuristics suggest malicious intent.",
    findings,
    verdict,
  };
}

/** --- Logs --- */

export function analyzeLogs(raw: string): AnalysisResult {
  const findings: Finding[] = [];
  const text = raw.trim();
  if (!text) {
    return {
      threatProbability: 0,
      riskScore: 0,
      threatType: "No input",
      action: "Paste auth, SSH, or VPN log lines (multi-line supported).",
      summary: "Empty log buffer.",
      findings: [
        {
          rule: "Input validation",
          severity: "info",
          detail: "Example: multiple 'Failed password' lines for same user from one IP.",
        },
      ],
      verdict: "safe",
    };
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  const lower = text.toLowerCase();

  const failPwd = (lower.match(/failed password|authentication failure|invalid user/g) || [])
    .length;
  if (failPwd >= 1) {
    findings.push({
      rule: "Authentication failures",
      severity: failPwd >= 6 ? "high" : failPwd >= 3 ? "medium" : "low",
      detail: `Detected ~${failPwd} failure-related token(s) — possible brute-force or credential stuffing.`,
    });
  }

  if (/\b(root)\b.*\b(accepted|session opened)\b/i.test(text)) {
    findings.push({
      rule: "Privileged interactive access",
      severity: "high",
      detail: "Root or superuser session markers — validate change ticket and source IP.",
    });
  }

  if (/\bsudo\b.*\bCOMMAND=/i.test(text)) {
    findings.push({
      rule: "Sudo command audit",
      severity: "medium",
      detail: "Sudo activity present — map to approved admin actions.",
    });
  }

  if (/\b(sshd|ssh2?)\b.*\b(fail|invalid|refused)\b/i.test(lower)) {
    findings.push({
      rule: "SSH hardening signals",
      severity: "medium",
      detail: "SSH daemon reporting failures — correlate with geo and time-of-day baselines.",
    });
  }

  if (/\b(impossible|travel|anomaly)\b/i.test(lower)) {
    findings.push({
      rule: "Risk engine keyword",
      severity: "high",
      detail: "Identity risk vocabulary suggests UEBA or IdP rule already fired.",
    });
  }

  const uniqueIps = new Set(
    [...text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)].map((m) => m[0])
  );
  if (uniqueIps.size >= 4 && failPwd >= 2) {
    findings.push({
      rule: "Distributed source pattern",
      severity: "high",
      detail: `${uniqueIps.size} distinct IPs with auth noise — spray or botnet-like behavior.`,
    });
  }

  if (lines.length >= 20 && failPwd < 2) {
    findings.push({
      rule: "Volume without failures",
      severity: "info",
      detail: "Large paste with few failure markers — may be benign noise or incomplete excerpt.",
    });
  }

  const score = aggregateScore(findings);
  const verdict = verdictFromScore(score);

  return {
    threatProbability: clamp(score, 0, 99),
    riskScore: clamp(Math.round(score * 0.87 + Math.min(lines.length, 15)), 0, 100),
    threatType: pickThreatType(findings, "Routine authentication telemetry"),
    action: pickAction(verdict),
    summary:
      verdict === "safe"
        ? "Log excerpt resembles normal operations; extend window for UEBA confidence."
        : verdict === "suspicious"
          ? "Identity or SSH anomalies warrant analyst review and optional step-up auth."
          : "Strong signs of coordinated abuse or privilege misuse in this window.",
    findings,
    verdict,
  };
}

export function formatAnalysisForChat(r: AnalysisResult): string {
  const lines = [
    `Verdict: ${r.verdict.toUpperCase()} | Risk score: ${r.riskScore}/100 | Threat probability: ~${r.threatProbability}%`,
    `Classification: ${r.threatType}`,
    `Summary: ${r.summary}`,
    r.findings.length
      ? `Signals:\n${r.findings
          .slice(0, 8)
          .map((f) => `• [${f.severity}] ${f.rule}: ${f.detail}`)
          .join("\n")}`
      : "",
    `Recommended action: ${r.action}`,
  ].filter(Boolean);
  return lines.join("\n\n");
}

export function chatReply(userText: string): string {
  const t = userText.trim();
  if (!t) return "Paste a URL, log snippet, or ask \"how do I use this\" for a quick tour.";

  if (/^how\s+do\s+i|how\s+to\s+use|what\s+can\s+you|help\b|^usage$/i.test(t)) {
    return [
      "Quick tour:",
      "1) Open AI Analysis (nav or scroll).",
      "2) Choose URL, File, or Logs.",
      "3) Paste samples — scores use on-device rules (demo, not VirusTotal).",
      "4) You can paste a URL right here in chat for the same analysis.",
      "",
      "Try: http + IP host, or many \"Failed password\" lines, or a double extension like photo.jpg.exe",
    ].join("\n");
  }

  if (/^https?:\/\//i.test(t) || /^[\w.-]+\.[a-z]{2,}\/[^\s]*$/i.test(t)) {
    const url = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    return formatAnalysisForChat(analyzeUrl(url));
  }

  if (t.split(/\n/).length >= 2 || /\b(sshd|pam|sudo|auth\.log|failed password)\b/i.test(t)) {
    return formatAnalysisForChat(analyzeLogs(t));
  }

  if (/^[a-f0-9]{32,64}$/i.test(t.replace(/\s/g, "")) || /\.(exe|ps1|bat|scr)\b/i.test(t)) {
    return formatAnalysisForChat(analyzeFileArtifact(t));
  }

  return [
    "I didn’t detect a URL or log-shaped paste.",
    "Try: paste a **full URL**, several **SSH/auth failure** lines, or a **filename / hash**.",
    "Say **help** for the guided tour.",
  ].join("\n");
}
