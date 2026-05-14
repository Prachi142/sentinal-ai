export type AlertSeverity = "Low" | "Medium" | "High" | "Critical";
export type AlertStatus = "Blocked" | "Investigating" | "Safe";

export interface AlertItem {
  id: string;
  timestamp: string;
  sourceIp: string;
  threatType: string;
  severity: AlertSeverity;
  status: AlertStatus;
}

export const initialAlerts: AlertItem[] = [
  {
    id: "ALT-9821",
    timestamp: "2026-05-14T14:22:11Z",
    sourceIp: "185.220.101.44",
    threatType: "Brute-force SSH",
    severity: "High",
    status: "Blocked",
  },
  {
    id: "ALT-9820",
    timestamp: "2026-05-14T14:21:02Z",
    sourceIp: "104.21.3.88",
    threatType: "Phishing URL",
    severity: "Critical",
    status: "Investigating",
  },
  {
    id: "ALT-9819",
    timestamp: "2026-05-14T14:18:47Z",
    sourceIp: "192.168.44.12",
    threatType: "Lateral movement",
    severity: "Medium",
    status: "Investigating",
  },
  {
    id: "ALT-9818",
    timestamp: "2026-05-14T14:15:33Z",
    sourceIp: "45.33.32.156",
    threatType: "DDoS probe",
    severity: "High",
    status: "Blocked",
  },
  {
    id: "ALT-9817",
    timestamp: "2026-05-14T14:11:09Z",
    sourceIp: "10.0.4.22",
    threatType: "Suspicious PowerShell",
    severity: "Critical",
    status: "Blocked",
  },
  {
    id: "ALT-9816",
    timestamp: "2026-05-14T14:08:51Z",
    sourceIp: "203.0.113.77",
    threatType: "Malware beacon",
    severity: "Critical",
    status: "Blocked",
  },
  {
    id: "ALT-9815",
    timestamp: "2026-05-14T14:05:12Z",
    sourceIp: "172.16.8.5",
    threatType: "Anomalous login",
    severity: "Low",
    status: "Safe",
  },
];

export const trafficSeries = [
  { t: "00:00", mb: 120 },
  { t: "02:00", mb: 95 },
  { t: "04:00", mb: 140 },
  { t: "06:00", mb: 210 },
  { t: "08:00", mb: 380 },
  { t: "10:00", mb: 420 },
  { t: "12:00", mb: 510 },
  { t: "14:00", mb: 460 },
];

export const attackCategories = [
  { name: "Malware", value: 32, color: "#38bdf8" },
  { name: "Phishing", value: 24, color: "#a78bfa" },
  { name: "DDoS", value: 18, color: "#34d399" },
  { name: "Insider", value: 12, color: "#f472b6" },
  { name: "Other", value: 14, color: "#94a3b8" },
];

export const mapHotspots = [
  { x: 22, y: 35, label: "NA-East" },
  { x: 48, y: 32, label: "EU-West" },
  { x: 78, y: 42, label: "APAC" },
  { x: 28, y: 58, label: "SA" },
  { x: 55, y: 48, label: "MEA" },
];

export const terminalSeeds = [
  "[sentinel-core] ingest: tls://edge-03.sentinel.ai:443 … OK",
  "[ml-engine] feature_vector dim=2048 batch=128 latency=12ms",
  "[threat-graph] correlating IOC hash=7f3a… with cluster C-441",
  "[soc] playbook SOAR-12 triggered: isolate_host(192.168.44.12)",
  "[dns] sinkhole resolved malicious domain → 0.0.0.0",
  "[ueba] score anomaly +2.4σ on user svc_api_reader",
  "[netflow] spike detected: 847 Mbps → 12.4 Gbps (mitigated)",
];

export const teamMembers = [
  { name: "Aanya Sharma", role: "ML & Detection Lead" },
  { name: "Jordan Lee", role: "Security Architecture" },
  { name: "Marcus Chen", role: "SOC Automation" },
];
