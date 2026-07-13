import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { RefreshCw, ShieldCheck, Maximize2, X } from "lucide-react";
import { toast } from "sonner";

const LS_KEY = "studentpay_wallet_qr_v1";
const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface StoredToken {
  studentId: string;
  token: string;
  issuedAt: number;
}

function loadToken(studentId: string): StoredToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (parsed.studentId !== studentId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToken(t: StoredToken) {
  localStorage.setItem(LS_KEY, JSON.stringify(t));
}

function newToken(): string {
  // 12-char base32-ish token, unique per student per refresh
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 12)
    .toUpperCase();
}

interface Props {
  studentId: string;
  studentName: string;
}

export function WalletQRCard({ studentId, studentName }: Props) {
  const [token, setToken] = useState<StoredToken | null>(null);
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const existing = loadToken(studentId);
    if (existing && Date.now() - existing.issuedAt < EXPIRY_MS) {
      setToken(existing);
    } else {
      const t: StoredToken = { studentId, token: newToken(), issuedAt: Date.now() };
      saveToken(t);
      setToken(t);
    }
  }, [studentId]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const refresh = () => {
    const t: StoredToken = { studentId, token: newToken(), issuedAt: Date.now() };
    saveToken(t);
    setToken(t);
    toast.success("QR code refreshed");
  };

  const payload = useMemo(() => {
    if (!token) return "";
    return JSON.stringify({
      type: "studentpay.wallet",
      studentId,
      token: token.token,
      issuedAt: token.issuedAt,
    });
  }, [token, studentId]);

  if (!token) return null;

  const remaining = Math.max(0, EXPIRY_MS - (now - token.issuedAt));
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
  const expired = remaining === 0;
  const pct = (remaining / EXPIRY_MS) * 100;

  return (
    <>
      <section className="rounded-3xl border border-primary/30 bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3 w-3" />
              Wallet QR
            </div>
            <div className="mt-1 font-display text-sm font-bold">Scan to pay or withdraw</div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Expand QR"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className={`rounded-2xl bg-white p-3 shadow-sm ${expired ? "opacity-40" : ""}`}>
            <QRCodeCanvas value={payload} size={128} bgColor="#ffffff" fgColor="#000000" level="H" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Student</div>
            <div className="truncate text-sm font-semibold">{studentName}</div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Token</div>
            <div className="font-mono text-xs font-semibold text-primary">{token.token}</div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{expired ? "Expired" : `Refreshes in ${mm}:${ss}`}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${expired ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <button
              onClick={refresh}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh QR
            </button>
          </div>
        </div>
      </section>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Wallet QR Code
              </div>
              <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <div className={`rounded-2xl bg-white p-5 ${expired ? "opacity-40" : ""}`}>
                <QRCodeCanvas value={payload} size={260} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold">{studentName}</div>
            <div className="font-mono text-xs text-muted-foreground">{studentId}</div>
            <div className="mt-1 font-mono text-xs text-primary">Token · {token.token}</div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              {expired ? "Expired — refresh to continue" : `Auto-refresh in ${mm}:${ss}`}
            </div>
            <button
              onClick={refresh}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh QR
            </button>
          </div>
        </div>
      )}
    </>
  );
}
