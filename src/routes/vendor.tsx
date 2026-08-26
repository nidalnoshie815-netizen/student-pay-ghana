import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import { addWithdrawal, formatGHS, getState, PAYMENT_METHODS } from "@/lib/mock-store";
import { signOut, updateProfileFull } from "@/lib/guardian-auth";
import {
  recordCharge,
  recordWithdrawal,
  topUpFloat,
  payoutCommission,
  markAllNotificationsRead,
  COMMISSION_RATE,
} from "@/lib/vendor-store";
import { useVendorLedger } from "@/hooks/use-vendor-ledger";
import {
  LogOut,
  Store,
  ScanLine,
  ShieldCheck,
  Wallet,
  Banknote,
  History,
  Bell,
  UserIcon,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — StudentPay" },
      { name: "description", content: "Scan, verify students, process withdrawals and track float and commission." },
    ],
  }),
  component: VendorDashboard,
});

type Tab = "scan" | "withdraw" | "float" | "commission" | "history" | "notifications" | "profile";

function VendorDashboard() {
  const user = useRequireRole("vendor");
  const [tab, setTab] = useState<Tab>("scan");
  const ledger = useVendorLedger(user?.id);
  if (!user) return null;

  const unread = ledger.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen pb-24">
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab("notifications")}
            className="relative rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>
          <button
            onClick={() => { signOut(); toast.success("Signed out"); }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 sm:space-y-6 sm:px-6">
        {/* Header card */}
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Vendor / Agent</p>
              <h1 className="truncate text-lg font-semibold">{user.businessName || user.fullName}</h1>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Float balance" value={formatGHS(ledger.float)} />
            <Stat label="Commission" value={formatGHS(ledger.commission)} accent />
            <Stat label="Transactions" value={String(ledger.transactions.length)} />
          </div>
        </section>

        {/* Tabs */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <TabBtn active={tab === "scan"} onClick={() => setTab("scan")} icon={<ScanLine className="h-3.5 w-3.5" />}>Scan / Charge</TabBtn>
          <TabBtn active={tab === "withdraw"} onClick={() => setTab("withdraw")} icon={<ArrowUpFromLine className="h-3.5 w-3.5" />}>Withdrawal</TabBtn>
          <TabBtn active={tab === "float"} onClick={() => setTab("float")} icon={<Wallet className="h-3.5 w-3.5" />}>Float</TabBtn>
          <TabBtn active={tab === "commission"} onClick={() => setTab("commission")} icon={<Banknote className="h-3.5 w-3.5" />}>Commission</TabBtn>
          <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={<History className="h-3.5 w-3.5" />}>History</TabBtn>
          <TabBtn active={tab === "notifications"} onClick={() => { setTab("notifications"); if (user) markAllNotificationsRead(user.id); }} icon={<Bell className="h-3.5 w-3.5" />}>Alerts</TabBtn>
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserIcon className="h-3.5 w-3.5" />}>Profile</TabBtn>
        </div>

        {tab === "scan" && <ScanChargePanel vendorId={user.id} vendorName={user.businessName || user.fullName} />}
        {tab === "withdraw" && <WithdrawalPanel vendorId={user.id} vendorName={user.businessName || user.fullName} float={ledger.float} />}
        {tab === "float" && <FloatPanel vendorId={user.id} float={ledger.float} />}
        {tab === "commission" && <CommissionPanel vendorId={user.id} commission={ledger.commission} />}
        {tab === "history" && <HistoryPanel ledger={ledger} />}
        {tab === "notifications" && <NotificationsPanel notifications={ledger.notifications} />}
        {tab === "profile" && <ProfilePanel />}
      </main>
    </div>
  );
}

/* ---------------- shared ui ---------------- */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ---------------- QR scanner (BarcodeDetector w/ manual fallback) ---------------- */

function QRScanner({ onDecoded }: { onDecoded: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = () => {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async () => {
    setError(null);
    // @ts-expect-error BarcodeDetector may not be typed
    if (typeof window.BarcodeDetector === "undefined") {
      setError("Live scanning isn't supported on this device. Enter the Student ID manually below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // @ts-expect-error BarcodeDetector may not be typed
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      setScanning(true);
      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const raw = codes[0].rawValue as string;
            stop();
            onDecoded(raw);
            return;
          }
        } catch {
          // ignore per-frame errors
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable");
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-2xl border border-border bg-black/60">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-xs text-muted-foreground px-4">
            Point the camera at a StudentPay QR code
          </div>
        )}
        {scanning && (
          <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-primary/70" />
        )}
      </div>
      <div className="flex justify-center gap-2">
        {!scanning ? (
          <button onClick={start} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            <Camera className="h-4 w-4" /> Start scanner
          </button>
        ) : (
          <button onClick={stop} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm">
            <CameraOff className="h-4 w-4" /> Stop
          </button>
        )}
      </div>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}

function parseQrPayload(text: string): { studentId: string; token?: string } | null {
  try {
    const j = JSON.parse(text);
    if (j.studentId) return { studentId: String(j.studentId).toUpperCase(), token: j.token };
  } catch {
    // treat as raw ID
  }
  const raw = text.trim().toUpperCase();
  if (/^SP-[A-Z0-9-]+$/.test(raw)) return { studentId: raw };
  return null;
}

/* ---------------- Panels ---------------- */

function verifyStudent(studentId: string) {
  const s = getState();
  if (studentId.toUpperCase() === s.account.studentId.toUpperCase()) {
    return { studentName: s.account.studentName, school: s.account.school, balance: s.account.balance };
  }
  return null;
}

function ScanChargePanel({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState<{ studentName: string; school: string; balance: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const doVerify = (id: string) => {
    const v = verifyStudent(id);
    if (v) { setVerified(v); toast.success(`Student verified: ${v.studentName}`); }
    else { setVerified(null); toast.error("Student ID not found"); }
  };

  const handleDecoded = (raw: string) => {
    const parsed = parseQrPayload(raw);
    if (!parsed) { toast.error("Invalid QR"); return; }
    setStudentId(parsed.studentId);
    doVerify(parsed.studentId);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (!verified) throw new Error("Verify the student first");
      addWithdrawal({
        amount: amt,
        studentId: studentId.trim(),
        note: `${vendorName}${note ? " — " + note : ""}`,
        category: "Vendor Payment",
      });
      const fee = recordCharge(vendorId, {
        amount: amt,
        studentId: studentId.trim().toUpperCase(),
        studentName: verified.studentName,
        note,
      });
      toast.success(`Charged ${formatGHS(amt)} · fee ${formatGHS(fee)}`);
      setAmount(""); setNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Charge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Scan a student's QR" icon={<ScanLine className="h-4 w-4 text-primary" />}>
        <QRScanner onDecoded={handleDecoded} />
      </Card>

      <Card title="Charge student" icon={<Banknote className="h-4 w-4 text-primary" />}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Student ID</label>
            <div className="mt-1 flex gap-2">
              <input
                value={studentId}
                onChange={(e) => { setStudentId(e.target.value.toUpperCase()); setVerified(null); }}
                placeholder="SP-XXXX-XXXX"
                className="input-field flex-1 font-mono tracking-widest"
                required
              />
              <button type="button" onClick={() => doVerify(studentId)} className="rounded-xl border border-primary/40 bg-primary/10 px-3 text-xs font-semibold text-primary">
                Verify
              </button>
            </div>
          </div>

          {verified && (
            <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold">{verified.studentName}</p>
                <p className="text-muted-foreground">{verified.school}</p>
                <p className="text-muted-foreground">Balance: {formatGHS(verified.balance)}</p>
              </div>
            </div>
          )}

          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (GHS)" className="input-field" required min="1" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="input-field" />

          <div className="text-[11px] text-muted-foreground">Commission earned on this charge: {formatGHS((Number(amount) || 0) * COMMISSION_RATE)}</div>

          <button disabled={loading || !verified} className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
            {loading ? "Processing…" : "Charge student"}
          </button>
        </form>
      </Card>
    </div>
  );
}

function WithdrawalPanel({ vendorId, vendorName, float }: { vendorId: string; vendorName: string; float: number }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [verified, setVerified] = useState<{ studentName: string; school: string; balance: number } | null>(null);
  const [stage, setStage] = useState<"input" | "confirm">("input");
  const [loading, setLoading] = useState(false);

  const doVerify = () => {
    const v = verifyStudent(studentId);
    if (v) { setVerified(v); toast.success(`Verified: ${v.studentName}`); }
    else { setVerified(null); toast.error("Student ID not found"); }
  };

  const proceed = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!verified) return toast.error("Verify the student first");
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (amt > verified.balance) return toast.error("Amount exceeds student balance");
    if (amt > float) return toast.error("Insufficient float. Top up first.");
    setStage("confirm");
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const amt = Number(amount);
      addWithdrawal({
        amount: amt,
        studentId: studentId.trim(),
        note: `${vendorName} — cash withdrawal`,
        category: "POS Withdrawal",
      });
      const fee = recordWithdrawal(vendorId, {
        amount: amt,
        studentId: studentId.trim().toUpperCase(),
        studentName: verified!.studentName,
        note: "Cash payout",
      });
      toast.success(`Paid ${formatGHS(amt)} · fee ${formatGHS(fee)}`);
      setStudentId(""); setAmount(""); setVerified(null); setStage("input");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Process cash withdrawal" icon={<ArrowUpFromLine className="h-4 w-4 text-primary" />}>
      {stage === "input" ? (
        <form onSubmit={proceed} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Student ID</label>
            <div className="mt-1 flex gap-2">
              <input value={studentId} onChange={(e) => { setStudentId(e.target.value.toUpperCase()); setVerified(null); }} placeholder="SP-XXXX-XXXX" className="input-field flex-1 font-mono tracking-widest" required />
              <button type="button" onClick={doVerify} className="rounded-xl border border-primary/40 bg-primary/10 px-3 text-xs font-semibold text-primary">Verify</button>
            </div>
          </div>
          {verified && (
            <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-semibold">{verified.studentName}</p>
                <p className="text-muted-foreground">{verified.school} · Balance {formatGHS(verified.balance)}</p>
              </div>
            </div>
          )}
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to disburse (GHS)" className="input-field" required min="1" />
          <p className="text-[11px] text-muted-foreground">Float available: <span className="font-semibold">{formatGHS(float)}</span></p>
          <button className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">Review withdrawal</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-1 text-sm">
            <Row k="Student" v={verified!.studentName} />
            <Row k="Student ID" v={studentId} />
            <Row k="School" v={verified!.school} />
            <Row k="Amount" v={formatGHS(Number(amount))} strong />
            <Row k="Commission" v={formatGHS(Number(amount) * COMMISSION_RATE)} />
            <Row k="Float after" v={formatGHS(float - Number(amount))} />
          </div>
          <p className="text-xs text-muted-foreground">Hand cash to the student, then confirm below to complete the withdrawal.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStage("input")} className="rounded-xl border border-border py-3 text-sm">
              <XCircle className="mr-1 inline h-4 w-4" /> Cancel
            </button>
            <button onClick={confirm} disabled={loading} className="rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              <CheckCircle2 className="mr-1 inline h-4 w-4" /> {loading ? "Confirming…" : "Confirm & pay"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={strong ? "font-bold" : "font-medium"}>{v}</span>
    </div>
  );
}

function FloatPanel({ vendorId, float }: { vendorId: string; float: number }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    topUpFloat(vendorId, amt, method);
    toast.success(`Float topped up ${formatGHS(amt)}`);
    setAmount("");
  };

  return (
    <Card title="Float management" icon={<Wallet className="h-4 w-4 text-primary" />}>
      <p className="mb-4 text-xs text-muted-foreground">
        Float is the cash you hold to pay out to students. Top it up from your mobile money wallet before processing withdrawals.
      </p>
      <div className="mb-4 rounded-xl border border-border bg-background/40 p-4">
        <p className="text-xs text-muted-foreground">Current float</p>
        <p className="mt-1 text-3xl font-bold">{formatGHS(float)}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Top-up method</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${method === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
              >
                {m.id}
              </button>
            ))}
          </div>
        </div>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (GHS)" className="input-field" required min="1" />
        <button className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
          <ArrowDownToLine className="mr-1 inline h-4 w-4" /> Top up float
        </button>
      </form>
    </Card>
  );
}

function CommissionPanel({ vendorId, commission }: { vendorId: string; commission: number }) {
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);

  const payout = () => {
    try {
      const amt = payoutCommission(vendorId, method);
      toast.success(`Paid out ${formatGHS(amt)} to ${method}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payout failed");
    }
  };

  return (
    <Card title="Commission wallet" icon={<Banknote className="h-4 w-4 text-primary" />}>
      <p className="mb-4 text-xs text-muted-foreground">
        You earn {(COMMISSION_RATE * 100).toFixed(2)}% commission on every charge and withdrawal you process.
      </p>
      <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">Available commission</p>
        <p className="mt-1 text-3xl font-bold text-primary">{formatGHS(commission)}</p>
      </div>
      <label className="text-xs text-muted-foreground">Payout to</label>
      <div className="mt-1 mb-3 grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${method === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {m.id}
          </button>
        ))}
      </div>
      <button onClick={payout} disabled={commission <= 0} className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
        Withdraw commission
      </button>
    </Card>
  );
}

function HistoryPanel({ ledger }: { ledger: ReturnType<typeof useVendorLedger> }) {
  return (
    <Card title="Transaction history" icon={<History className="h-4 w-4 text-primary" />}>
      {ledger.transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {ledger.transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium capitalize">{t.kind.replace("_", " ")}{t.studentName ? ` · ${t.studentName}` : ""}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString()}{t.note ? ` · ${t.note}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.kind === "float_topup" ? "text-primary" : ""}`}>
                  {t.kind === "float_topup" ? "+" : ""}{formatGHS(t.amount)}
                </p>
                {t.fee > 0 && <p className="text-[11px] text-muted-foreground">fee {formatGHS(t.fee)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function NotificationsPanel({ notifications }: { notifications: ReturnType<typeof useVendorLedger>["notifications"] }) {
  return (
    <Card title="Notifications" icon={<Bell className="h-4 w-4 text-primary" />}>
      {notifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.id} className="py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{n.title}</p>
                <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProfilePanel() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // hydrate from session
    import("@/lib/guardian-auth").then(({ getSession }) => {
      const s = getSession();
      if (s) {
        setFullName(s.fullName || "");
        setPhone(s.phone || "");
        setAddress(s.address || "");
        setOccupation(s.occupation || "");
      }
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      updateProfileFull({ fullName, phone, address, occupation });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Vendor profile" icon={<UserIcon className="h-4 w-4 text-primary" />}>
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Business / Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field mt-1" required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Business address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Business type</label>
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Provisions shop, Mobile money agent" className="input-field mt-1" />
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          <Save className="mr-1 inline h-4 w-4" /> {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Card>
  );
}
