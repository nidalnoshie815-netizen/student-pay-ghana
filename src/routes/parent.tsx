import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { PaymentMethodPicker } from "@/components/PaymentMethodPicker";
import { addDeposit, formatGHS, type PaymentMethod } from "@/lib/mock-store";
import { useStore } from "@/hooks/use-store";
import { useGuardian } from "@/hooks/use-guardian";
import { signOut } from "@/lib/guardian-auth";
import { ArrowDownLeft, ArrowUpRight, Bell, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — StudentPay" },
      { name: "description", content: "Top up your student and view withdrawal notifications." },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { account, transactions } = useStore();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>("MTN MoMo");
  const [studentId, setStudentId] = useState(guardian?.studentId ?? account.studentId);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  if (!guardian) return null;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!method) return toast.error("Choose a payment method");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    try {
      addDeposit({ amount: amt, method, studentId, parentName: guardian?.fullName ?? "Guardian" });
      setSuccess(true);
      setAmount("");
      toast.success(`${formatGHS(amt)} sent via ${method}`);
      setTimeout(() => setSuccess(false), 1800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  const withdrawals = transactions.filter((t) => t.type === "withdrawal");

  return (
    <div className="min-h-screen">
      <Header
        tab="parent"
        right={
          <div className="ml-2 flex items-center gap-2">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium text-foreground">{guardian.fullName}</div>
              <div className="text-muted-foreground">{guardian.email}</div>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        }
      />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Linked student */}
          <section className="md:col-span-1">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Linked student
            </h2>
            <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-lg font-semibold">{account.studentName}</div>
              <div className="text-sm text-muted-foreground">{account.school}</div>
              <div className="mt-4 rounded-xl bg-background/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Student ID
                </div>
                <div className="mt-0.5 font-mono text-base tracking-widest text-primary">
                  {account.studentId}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">Current balance</div>
                <div className="font-display text-2xl font-bold">
                  {formatGHS(account.balance)}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <h2 className="mt-8 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Bell className="h-3 w-3" /> Withdrawal alerts
            </h2>
            <div className="mt-3 space-y-2">
              {withdrawals.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No withdrawals yet.
                </div>
              )}
              {withdrawals.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15 text-warning">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {account.studentName} withdrew {formatGHS(t.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.note ?? "Wallet withdrawal"} · {timeAgo(t.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment form */}
          <section className="md:col-span-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Top up wallet
            </h2>
            <form
              onSubmit={handlePay}
              className="mt-3 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <label className="text-xs font-medium text-muted-foreground">Student ID code</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="SP-XXXX-XXXX"
                className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-3 font-mono tracking-widest outline-none focus:border-primary"
              />

              <label className="mt-5 block text-xs font-medium text-muted-foreground">
                Amount (GH₵)
              </label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  GH₵
                </span>
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

              <div className="mt-2 flex flex-wrap gap-2">
                {[20, 50, 100, 200, 500].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs hover:border-primary"
                  >
                    GH₵ {v}
                  </button>
                ))}
              </div>

              <label className="mt-6 block text-xs font-medium text-muted-foreground">
                Payment method
              </label>
              <div className="mt-2">
                <PaymentMethodPicker value={method} onChange={setMethod} />
              </div>

              <button
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Sent!
                  </>
                ) : (
                  <>Pay {amount ? formatGHS(parseFloat(amount) || 0) : "now"}</>
                )}
              </button>
            </form>

            <h2 className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">
              All transactions
            </h2>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {transactions.map((t) => (
                <TxRow key={t.id} tx={t} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function TxRow({ tx }: { tx: import("@/lib/mock-store").Transaction }) {
  const isDeposit = tx.type === "deposit";
  return (
    <div className="flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isDeposit ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
        }`}
      >
        {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">
          {isDeposit ? `Top up via ${tx.method}` : `Withdrawal · ${tx.note ?? "wallet"}`}
        </div>
        <div className="text-xs text-muted-foreground">{timeAgo(tx.createdAt)}</div>
      </div>
      <div
        className={`font-mono text-sm font-semibold ${
          isDeposit ? "text-primary" : "text-foreground"
        }`}
      >
        {isDeposit ? "+" : "−"} {formatGHS(tx.amount)}
      </div>
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

export function Header({ tab, right }: { tab: "parent" | "student"; right?: React.ReactNode }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Logo />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <TabLink to="/parent" active={tab === "parent"}>
            Parent
          </TabLink>
          <TabLink to="/student" active={tab === "student"}>
            Student
          </TabLink>
        </div>
        {right}
      </div>
    </header>
  );
}

function TabLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-gradient-primary text-primary-foreground shadow-glow"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
