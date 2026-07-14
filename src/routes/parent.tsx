import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { QuickActions } from "@/components/QuickActions";
import { BottomNav } from "@/components/BottomNav";
import {
  addWithdrawal,
  formatGHS,
  type Transaction,
  type TxCategory,
} from "@/lib/mock-store";
import { useStore } from "@/hooks/use-store";
import { useGuardian } from "@/hooks/use-guardian";
import { WalletQRCard } from "@/components/WalletQRCard";
import { signOut } from "@/lib/guardian-auth";
import { generateAIAlerts, type AlertLevel } from "@/lib/ai-alerts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  LogOut,
  Sparkles,
  X,
  CreditCard,
  Wallet,
  Send,
  Store,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — StudentPay" },
      { name: "description", content: "Top up your student and get AI-powered alerts." },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { account, transactions } = useStore();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!guardian) { navigate({ to: "/guardian/auth" }); return; }
    const role = (guardian.role as "parent" | "student" | "vendor" | "admin") || "parent";
    if (role !== "parent") {
      const map = { student: "/student", vendor: "/vendor", admin: "/admin" } as const;
      navigate({ to: map[role as "student" | "vendor" | "admin"] });
    }
  }, [guardian, navigate]);

  const aiAlerts = useMemo(
    () => generateAIAlerts(account, transactions),
    [account, transactions],
  );

  if (!guardian) return null;

  const recent = transactions.slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/guardian/profile" className="text-right text-[11px] group">
            <div className="font-medium text-foreground group-hover:text-primary">
              {guardian.fullName.split(" ")[0]}
            </div>
            <div className="text-muted-foreground">Guardian</div>
          </Link>
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5">
        {/* Balance card */}
        <section className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
          <div className="text-xs opacity-80">Wallet balance</div>
          <div className="mt-1 font-display text-3xl font-bold">
            {formatGHS(account.balance)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div>
              <div className="opacity-70">Student</div>
              <div className="font-semibold">{account.studentName}</div>
            </div>
            <div className="text-right">
              <div className="opacity-70">ID</div>
              <div className="font-mono tracking-wider">{account.studentId}</div>
            </div>
          </div>
        </section>

        {/* Wallet QR - prominent */}
        <section className="mt-5">
          <WalletQRCard studentId={account.studentId} studentName={account.studentName} />
        </section>

        {/* Quick actions */}
        <section className="mt-5">
          <QuickActions onWithdraw={() => setWithdrawOpen(true)} />
        </section>

        {/* AI Alerts */}
        <section className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              AI Alerts
            </h2>
            <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              LIVE
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {aiAlerts.slice(0, 2).map((a) => (
              <AlertCard
                key={a.id}
                level={a.level}
                title={a.title}
                emoji={a.emoji}
                message={a.message}
              />
            ))}
          </div>
          <Link
            to="/insights"
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            See all insights →
          </Link>
        </section>

        {/* Recent Transactions */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Recent transactions
            </h2>
            <Link
              to="/transactions"
              className="text-xs font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {recent.length === 0 && (
              <div className="p-5 text-center text-sm text-muted-foreground">
                No transactions yet
              </div>
            )}
            {recent.map((t) => (
              <CategoryTxRow key={t.id} tx={t} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />

      {withdrawOpen && (
        <WithdrawDialog
          studentId={account.studentId}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </div>
  );
}

function AlertCard({
  level,
  title,
  emoji,
  message,
}: {
  level: AlertLevel;
  title: string;
  emoji: string;
  message: string;
}) {
  const styles: Record<AlertLevel, string> = {
    info: "border-border bg-card",
    success: "border-primary/40 bg-primary/5",
    warning: "border-warning/40 bg-warning/5",
    critical: "border-destructive/50 bg-destructive/10",
  };
  return (
    <div className={`rounded-xl border p-3 ${styles[level]}`}>
      <div className="text-sm font-semibold">
        <span className="mr-1.5">{emoji}</span>
        {title}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{message}</div>
    </div>
  );
}

function categoryIcon(c: TxCategory) {
  switch (c) {
    case "POS Withdrawal":
      return CreditCard;
    case "Wallet Funding":
      return Wallet;
    case "Transfer":
      return Send;
    case "Vendor Payment":
      return Store;
  }
}

function CategoryTxRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit";
  const category: TxCategory =
    tx.category ?? (isDeposit ? "Wallet Funding" : "Vendor Payment");
  const Icon = categoryIcon(category);
  return (
    <div className="flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isDeposit ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{category}</div>
        <div className="truncate text-xs text-muted-foreground">
          {tx.note ?? tx.method ?? "—"} · {timeAgo(tx.createdAt)}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {isDeposit ? (
          <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
        ) : (
          <ArrowUpRight className="h-3.5 w-3.5 text-warning" />
        )}
        <span
          className={`font-mono text-sm font-semibold ${
            isDeposit ? "text-primary" : "text-foreground"
          }`}
        >
          {isDeposit ? "+" : "−"} {formatGHS(tx.amount)}
        </span>
      </div>
    </div>
  );
}

function WithdrawDialog({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"form" | "qr">("form");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    try {
      addWithdrawal({ amount: amt, studentId, note: note || undefined });
      toast.success(`Withdrew ${formatGHS(amt)}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  const qrPayload = JSON.stringify({
    type: "studentpay.withdraw",
    studentId,
    amount: amount ? parseFloat(amount) : undefined,
    note: note || undefined,
    ts: Date.now(),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handle}
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-card sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {mode === "form" ? "Withdraw" : "Scan to withdraw"}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("form")}
            className={`rounded-lg py-2 ${mode === "form" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            Enter amount
          </button>
          <button
            type="button"
            onClick={() => setMode("qr")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 ${mode === "qr" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            <QrCode className="h-3.5 w-3.5" />
            QR code
          </button>
        </div>

        {mode === "form" ? (
          <>
            <label className="mt-4 block text-xs font-medium text-muted-foreground">
              Amount (GH₵)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">GH₵</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-border bg-input py-3 pl-14 pr-4 text-lg font-semibold outline-none focus:border-primary"
              />
            </div>

            <label className="mt-4 block text-xs font-medium text-muted-foreground">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What is this for?"
              className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:border-primary"
            />

            <button
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>Confirm withdrawal</>
              )}
            </button>
          </>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <QRCodeCanvas
                value={qrPayload}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Show this QR code to the cashier or POS terminal to authorize the withdrawal.
            </div>
            <div className="w-full rounded-xl border border-border bg-muted/40 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Student ID</div>
              <div className="font-mono text-sm font-semibold">{studentId}</div>
              {amount && (
                <div className="mt-1 text-xs text-primary">
                  Requested: {formatGHS(parseFloat(amount) || 0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMode("form")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Set an amount for this QR →
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
