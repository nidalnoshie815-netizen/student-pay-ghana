import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  GraduationCap,
  Home,
  LogOut,
  Receipt,
  User,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import { useStore } from "@/hooks/use-store";
import { formatGHS, type Transaction } from "@/lib/mock-store";
import { signOut } from "@/lib/guardian-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — StudentPay" },
      {
        name: "description",
        content:
          "Check your balance and withdraw money at a Student Pay POS using your card/chip.",
      },
    ],
  }),
  component: StudentDashboard,
});

type Tab = "home" | "transactions" | "profile";

function StudentDashboard() {
  const user = useRequireRole("student");
  const state = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const linked = user?.students?.[0];
  const balance =
    state.account.studentId === linked?.studentId ? state.account.balance : 250;

  const myTransactions = useMemo(() => {
    if (!linked?.studentId) return [];
    return state.transactions.filter((t) => t.studentId === linked.studentId);
  }, [state.transactions, linked?.studentId]);

  if (!user) return null;

  const balanceText = showBalance ? formatGHS(balance) : "GH₵ ••••••";

  return (
    <div className="relative min-h-screen pb-24">
      {/* ambient gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.78_0.22_145/0.14),transparent)]" />

      {/* Header */}
      <header className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-5 sm:px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            onClick={() => toast.info("No new notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <button
            aria-label="Profile"
            onClick={() => setTab("profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <User className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 sm:px-5">
        {tab === "home" && (
          <>
            {/* Greeting */}
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h1 className="truncate font-display text-xl font-bold">
                {user.fullName}
              </h1>
            </div>

            {/* Balance card */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Available Balance
                </p>
                <button
                  onClick={() => setShowBalance((s) => !s)}
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground"
                >
                  {showBalance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {balanceText}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  {linked?.studentId || "—"} · {linked?.school || "School not set"}
                </span>
              </p>
            </section>

            {/* Withdraw at POS */}
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-4 font-display text-base font-bold text-primary-foreground shadow-glow transition hover:opacity-95 active:scale-[0.99]"
            >
              <Landmark className="h-5 w-5" />
              Withdraw at POS
            </button>

            {/* Recent transactions */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">
                  Recent Transactions
                </h2>
                <button
                  onClick={() => setTab("transactions")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                {myTransactions.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    No transactions yet
                  </p>
                )}
                {myTransactions.slice(0, 4).map((t) => (
                  <TxRow key={t.id} tx={t} onTap={() => setSelectedTx(t)} />
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "transactions" && (
          <section>
            <h1 className="font-display text-2xl font-bold">Transactions</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap any transaction to see details
            </p>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {myTransactions.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No transactions yet
                </p>
              )}
              {myTransactions.map((t) => (
                <TxRow key={t.id} tx={t} onTap={() => setSelectedTx(t)} />
              ))}
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Profile</h1>

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-lg font-bold text-primary-foreground shadow-glow">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              <ProfileRow label="Student ID" value={linked?.studentId || "—"} mono />
              <ProfileRow label="School" value={linked?.school || "Not set"} />
              <ProfileRow label="Phone Number" value={user.phone || "—"} />
              <ProfileRow
                label="Account Status"
                value="Active"
                valueClass="text-primary"
              />
            </div>

            <button
              onClick={() => {
                signOut();
                toast.success("Signed out");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-3.5 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <p className="text-center text-xs text-muted-foreground">
              <Link to="/settings" className="hover:text-foreground">
                App settings
              </Link>
            </p>
          </section>
        )}
      </main>

      {/* Withdraw at POS modal */}
      {withdrawOpen && (
        <Modal onClose={() => setWithdrawOpen(false)} title="Withdraw at POS">
          <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Available Balance
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{balanceText}</p>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Amount to Withdraw (GH₵)
            </span>
            <input
              type="number"
              min="1"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50"
              className="input-field text-lg font-semibold"
            />
          </label>

          <button
            onClick={() => {
              const amt = Number(amount);
              if (!amt || amt <= 0) {
                toast.error("Enter a valid amount");
                return;
              }
              if (amt > balance) {
                toast.error("Amount exceeds your available balance");
                return;
              }
              toast.success(
                `Withdrawal of ${formatGHS(amt)} ready. Visit a Student Pay POS agent to complete it.`
              );
              setWithdrawOpen(false);
              setAmount("");
            }}
            className="mt-4 w-full rounded-2xl bg-gradient-primary px-6 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-glow transition hover:opacity-95 active:scale-[0.99]"
          >
            Confirm Withdrawal
          </button>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Visit an authorized Student Pay POS agent and use your Student Pay
            card/chip to complete the withdrawal.
          </p>
        </Modal>
      )}

      {/* Transaction details modal */}
      {selectedTx && (
        <Modal onClose={() => setSelectedTx(null)} title="Transaction Details">
          <div className="flex flex-col items-center py-2">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                selectedTx.type === "deposit"
                  ? "bg-primary/15 text-primary"
                  : "bg-warning/15 text-warning"
              }`}
            >
              {selectedTx.type === "deposit" ? (
                <ArrowDownLeft className="h-6 w-6" />
              ) : (
                <ArrowUpRight className="h-6 w-6" />
              )}
            </div>
            <p className="mt-3 font-display text-2xl font-bold">
              {selectedTx.type === "deposit" ? "+" : "−"}
              {formatGHS(selectedTx.amount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedTx.type === "deposit" ? "Received" : "Successful"}
            </p>
          </div>
          <div className="mt-2 divide-y divide-border rounded-2xl border border-border">
            <DetailRow
              label="Type"
              value={selectedTx.category ?? (selectedTx.type === "deposit" ? "Wallet Funding" : "POS Withdrawal")}
            />
            {selectedTx.note && <DetailRow label="Note" value={selectedTx.note} />}
            {selectedTx.method && <DetailRow label="Method" value={selectedTx.method} />}
            <DetailRow
              label="Status"
              value={selectedTx.status === "completed" ? "Successful" : "Pending"}
              valueClass="text-primary"
            />
            <DetailRow
              label="Date"
              value={new Date(selectedTx.createdAt).toLocaleString("en-GH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
            <DetailRow label="Reference" value={selectedTx.id.slice(0, 8)} mono />
          </div>
        </Modal>
      )}

      {/* Student bottom nav: Home | Transactions | Profile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1">
          <StudentNavItem
            label="Home"
            icon={Home}
            active={tab === "home"}
            onClick={() => setTab("home")}
          />
          <StudentNavItem
            label="Transactions"
            icon={Receipt}
            active={tab === "transactions"}
            onClick={() => setTab("transactions")}
          />
          <StudentNavItem
            label="Profile"
            icon={User}
            active={tab === "profile"}
            onClick={() => setTab("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function StudentNavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium leading-tight transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
}

function TxRow({ tx, onTap }: { tx: Transaction; onTap: () => void }) {
  const isDeposit = tx.type === "deposit";
  const label =
    tx.category ?? (isDeposit ? "School Allowance" : "POS Withdrawal");
  return (
    <button
      onClick={onTap}
      className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-secondary/40 sm:p-4"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          isDeposit ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
        }`}
      >
        {isDeposit ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
          {tx.note ?? tx.method ?? "Student Pay"} ·{" "}
          {new Date(tx.createdAt).toLocaleDateString("en-GH", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`font-mono text-[13px] font-semibold sm:text-sm ${
            isDeposit ? "text-primary" : "text-foreground"
          }`}
        >
          {isDeposit ? "+" : "−"}
          {formatGHS(tx.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {isDeposit ? "Received" : "Successful"}
        </p>
      </div>
    </button>
  );
}

function ProfileRow({
  label,
  value,
  mono,
  valueClass = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={`min-w-0 truncate text-sm font-medium ${mono ? "font-mono" : ""} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  valueClass = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={`min-w-0 truncate text-xs font-medium ${mono ? "font-mono" : ""} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
