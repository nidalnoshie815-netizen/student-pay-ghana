import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  Lock,
  LogOut,
  Receipt,
  Snowflake,
  User,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import { formatGHS } from "@/lib/mock-store";
import { signOut } from "@/lib/guardian-auth";
import { toast } from "sonner";
import {
  MOCK_STUDENT,
  MOCK_TRANSACTIONS,
  formatDate,
  formatDateTime,
  formatTime,
  makeRef,
  type StudentTx,
} from "@/lib/student-mock";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Student Pay" },
      {
        name: "description",
        content:
          "Check your Student Pay balance, withdraw at an authorized POS, view your student card and track transactions.",
      },
      { property: "og:title", content: "Student Dashboard — Student Pay" },
      {
        property: "og:description",
        content:
          "Balance, POS withdrawals, card status and transaction history for Student Pay students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentApp,
});

type Tab = "home" | "withdraw" | "transactions" | "profile";
type WithdrawStep = "amount" | "confirm" | "success";

function StudentApp() {
  const user = useRequireRole("student");

  const [tab, setTab] = useState<Tab>("home");
  const [showCard, setShowCard] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(MOCK_STUDENT.balance);
  const [txs, setTxs] = useState<StudentTx[]>(MOCK_TRANSACTIONS);
  const [frozen, setFrozen] = useState(false);

  const [step, setStep] = useState<WithdrawStep>("amount");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<StudentTx | null>(null);

  const profile = {
    ...MOCK_STUDENT,
    name: user?.fullName || MOCK_STUDENT.name,
    studentId: user?.students?.[0]?.studentId || MOCK_STUDENT.studentId,
    school: user?.students?.[0]?.school || MOCK_STUDENT.school,
    phone: user?.phone || MOCK_STUDENT.phone,
    email: user?.email || MOCK_STUDENT.email,
  };
  const firstName = profile.name.split(" ")[0];

  if (!user) return null;

  const balanceText = showBalance ? formatGHS(balance) : "GH₵ ••••••";

  function openWithdraw() {
    setStep("amount");
    setAmount("");
    setReceipt(null);
    setShowCard(false);
    setTab("withdraw");
  }

  function confirmWithdraw() {
    const value = Number(amount);
    const tx: StudentTx = {
      id: crypto.randomUUID(),
      ref: makeRef(),
      type: "POS Withdrawal",
      direction: "out",
      amount: value,
      at: Date.now(),
      status: "Successful",
      detail: "Authorized Student Pay POS",
    };
    setBalance((b) => b - value);
    setTxs((prev) => [tx, ...prev]);
    setReceipt(tx);
    setStep("success");
  }

  return (
    <div className="relative min-h-screen pb-28">
      <header className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-6 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              Welcome, {firstName}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {profile.studentId}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast("No new notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
        </button>
      </header>

      <main className="mx-auto max-w-md px-4 pt-5 sm:px-5">
        {showCard ? (
          <CardScreen
            profile={profile}
            frozen={frozen}
            onToggleFreeze={() => {
              setFrozen((f) => !f);
              toast.success(frozen ? "Card unfrozen" : "Card frozen");
            }}
            onBack={() => setShowCard(false)}
          />
        ) : tab === "home" ? (
          <HomeScreen
            balanceText={balanceText}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance((s) => !s)}
            onWithdraw={openWithdraw}
            onCard={() => setShowCard(true)}
            txs={txs.slice(0, 4)}
            onSeeAll={() => setTab("transactions")}
          />
        ) : tab === "withdraw" ? (
          <WithdrawScreen
            step={step}
            amount={amount}
            setAmount={setAmount}
            balance={balance}
            receipt={receipt}
            onContinue={() => setStep("confirm")}
            onBack={() => setStep("amount")}
            onConfirm={confirmWithdraw}
            onDone={() => setTab("home")}
          />
        ) : tab === "transactions" ? (
          <TransactionsScreen txs={txs} />
        ) : (
          <ProfileScreen profile={profile} />
        )}
      </main>

      <StudentNav
        tab={tab}
        onChange={(t) => {
          setShowCard(false);
          if (t === "withdraw") openWithdraw();
          else setTab(t);
        }}
      />
    </div>
  );
}

/* ---------------- Home ---------------- */

function HomeScreen({
  balanceText,
  showBalance,
  onToggleBalance,
  onWithdraw,
  onCard,
  txs,
  onSeeAll,
}: {
  balanceText: string;
  showBalance: boolean;
  onToggleBalance: () => void;
  onWithdraw: () => void;
  onCard: () => void;
  txs: StudentTx[];
  onSeeAll: () => void;
}) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-3xl border border-border bg-gradient-primary p-5 text-primary-foreground shadow-glow sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">
            Available Balance
          </p>
          <button
            type="button"
            onClick={onToggleBalance}
            aria-label={showBalance ? "Hide balance" : "Show balance"}
            className="rounded-full bg-black/10 p-2"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 font-mono text-[2rem] font-bold leading-tight sm:text-4xl">
          {balanceText}
        </p>
        <p className="mt-1 text-xs opacity-80">Student Pay wallet</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onWithdraw}
          className="flex flex-col items-start gap-2 rounded-2xl bg-primary p-4 text-left text-primary-foreground transition active:scale-[0.98]"
        >
          <Wallet className="h-6 w-6" />
          <span className="text-sm font-semibold">Withdraw</span>
          <span className="text-[11px] opacity-80">At an authorized POS</span>
        </button>
        <button
          type="button"
          onClick={onCard}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition active:scale-[0.98]"
        >
          <CreditCard className="h-6 w-6 text-primary" />
          <span className="text-sm font-semibold">My Card</span>
          <span className="text-[11px] text-muted-foreground">View card status</span>
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Transactions</h2>
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs text-primary hover:underline"
          >
            See all
          </button>
        </div>
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {txs.map((t) => (
            <TxRow key={t.id} tx={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Withdraw ---------------- */

const QUICK = [20, 50, 100, 200];

function WithdrawScreen({
  step,
  amount,
  setAmount,
  balance,
  receipt,
  onContinue,
  onBack,
  onConfirm,
  onDone,
}: {
  step: WithdrawStep;
  amount: string;
  setAmount: (v: string) => void;
  balance: number;
  receipt: StudentTx | null;
  onContinue: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onDone: () => void;
}) {
  const value = Number(amount);
  const valid = value > 0 && value <= balance;

  if (step === "success" && receipt) {
    return (
      <div className="animate-in fade-in duration-300 space-y-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-11 w-11 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Withdrawal Successful</h1>
          <p className="mt-1 font-mono text-3xl font-bold text-primary">
            {formatGHS(receipt.amount)}
          </p>
        </div>
        <dl className="space-y-3 rounded-2xl border border-border bg-card p-4 text-left text-sm">
          <Row label="Date & time" value={formatDateTime(receipt.at)} />
          <Row label="Reference" value={receipt.ref} mono />
          <Row label="Remaining balance" value={formatGHS(balance)} mono />
          <Row label="Status" value="Successful" />
        </dl>
        <button
          type="button"
          onClick={onDone}
          className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="animate-in fade-in duration-300 space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-2xl font-bold">Confirm Withdrawal</h1>
        <dl className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row label="Amount" value={formatGHS(value)} mono />
          <Row label="Available balance" value={formatGHS(balance)} mono />
          <Row label="New balance" value={formatGHS(balance - value)} mono />
        </dl>
        <p className="text-xs text-muted-foreground">
          Complete this withdrawal at an authorized Student Pay POS agent.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition active:scale-[0.99]"
        >
          Confirm Withdrawal
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-5">
      <h1 className="font-display text-2xl font-bold">Withdraw</h1>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Available balance</p>
        <p className="mt-1 font-mono text-2xl font-bold text-primary">
          {formatGHS(balance)}
        </p>
      </div>

      <div>
        <label htmlFor="amt" className="text-sm font-medium">
          Amount (GH₵)
        </label>
        <input
          id="amt"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.00"
          className="input-field mt-2 font-mono text-lg"
        />
        <div className="mt-3 grid grid-cols-4 gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className={`rounded-xl border py-2 text-xs font-medium transition ${
                Number(amount) === q
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              GH₵{q}
            </button>
          ))}
        </div>
        {value > balance && (
          <p className="mt-2 text-xs text-destructive">Amount exceeds your balance.</p>
        )}
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={onContinue}
        className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition active:scale-[0.99] disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}

/* ---------------- Transactions ---------------- */

type Filter = "All" | "Deposits" | "Withdrawals" | "Payments";

function TransactionsScreen({ txs }: { txs: StudentTx[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<StudentTx | null>(null);

  const list = useMemo(
    () =>
      txs.filter((t) =>
        filter === "All"
          ? true
          : filter === "Deposits"
            ? t.type === "School Deposit"
            : filter === "Withdrawals"
              ? t.type === "POS Withdrawal"
              : t.type === "Vendor Payment",
      ),
    [txs, filter],
  );

  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      <h1 className="font-display text-2xl font-bold">Transactions</h1>
      <div className="flex flex-wrap gap-2">
        {(["All", "Deposits", "Withdrawals", "Payments"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filter === f
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {list.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No transactions
          </p>
        )}
        {list.map((t) => (
          <TxRow key={t.id} tx={t} onClick={() => setSelected(t)} />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold">{selected.type}</h2>
            <p
              className={`mt-1 font-mono text-2xl font-bold ${
                selected.direction === "in" ? "text-primary" : "text-foreground"
              }`}
            >
              {selected.direction === "in" ? "+" : "−"} {formatGHS(selected.amount)}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Date" value={formatDate(selected.at)} />
              <Row label="Time" value={formatTime(selected.at)} />
              <Row label="Status" value={selected.status} />
              <Row label="Reference" value={selected.ref} mono />
              {selected.detail && <Row label="Details" value={selected.detail} />}
            </dl>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-xl border border-border py-3 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TxRow({ tx, onClick }: { tx: StudentTx; onClick?: () => void }) {
  const isIn = tx.direction === "in";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-secondary/40 sm:p-4"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isIn ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
        }`}
      >
        {isIn ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{tx.type}</span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {formatDate(tx.at)} · {formatTime(tx.at)} · {tx.status}
        </span>
      </span>
      <span
        className={`shrink-0 font-mono text-[13px] font-semibold ${
          isIn ? "text-primary" : "text-foreground"
        }`}
      >
        {isIn ? "+" : "−"} {formatGHS(tx.amount)}
      </span>
    </button>
  );
}

/* ---------------- My Card ---------------- */

function CardScreen({
  profile,
  frozen,
  onToggleFreeze,
  onBack,
}: {
  profile: typeof MOCK_STUDENT;
  frozen: boolean;
  onToggleFreeze: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-in fade-in duration-300 space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-2xl font-bold">My Card</h1>

      <div
        className={`rounded-3xl border border-border p-5 shadow-card transition ${
          frozen ? "bg-secondary opacity-70" : "bg-gradient-primary text-primary-foreground"
        }`}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
            Student Pay
          </span>
          <CreditCard className="h-6 w-6 opacity-80" />
        </div>
        <p className="mt-8 font-mono text-lg tracking-widest">{profile.cardNumber}</p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate font-mono text-[11px] opacity-80">
              {profile.studentId}
            </p>
          </div>
          <div className="text-right text-[11px] opacity-80">
            <p>Valid thru</p>
            <p className="font-mono">{profile.cardExpiry}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Row label="Card status" value={frozen ? "Frozen" : "Active"} />
        <Row label="Student ID" value={profile.studentId} mono />
        <Row label="Expiry" value={profile.cardExpiry} mono />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onToggleFreeze}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium"
        >
          <Snowflake className="h-4 w-4 text-primary" />
          {frozen ? "Unfreeze Card" : "Freeze Card"}
        </button>
        <button
          type="button"
          onClick={() =>
            toast("Full card details are only shown at a verified Student Pay desk.")
          }
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium"
        >
          <Lock className="h-4 w-4 text-primary" /> Card Details
        </button>
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */

function ProfileScreen({ profile }: { profile: typeof MOCK_STUDENT }) {
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="animate-in fade-in duration-300 space-y-5">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-lg font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {profile.studentId}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <Row label="School" value={profile.school} />
        <Row label="Programme" value={profile.programme} />
        <Row label="Phone" value={profile.phone} />
        <Row label="Email" value={profile.email} />
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <ActionRow icon={KeyRound} label="Change PIN" />
        <ActionRow icon={Bell} label="Notification settings" />
        <ActionRow icon={Lock} label="Security settings" />
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          toast.success("Signed out");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 py-3 text-sm font-medium text-destructive"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
}: {
  icon: typeof Bell;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => toast("Coming soon")}
      className="flex w-full items-center gap-3 p-4 text-left text-sm transition hover:bg-secondary/40"
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground">›</span>
    </button>
  );
}

/* ---------------- Shared ---------------- */

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={`min-w-0 text-right font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "withdraw", label: "Withdraw", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "profile", label: "Profile", icon: User },
] as const;

function StudentNav({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-between gap-1 px-2 py-2 sm:px-4">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="w-full truncate text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
