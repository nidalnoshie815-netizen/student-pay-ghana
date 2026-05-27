import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "./parent";
import { addWithdrawal, formatGHS } from "@/lib/mock-store";
import { useStore } from "@/hooks/use-store";
import { ArrowDownLeft, ArrowUpRight, Copy, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — StudentPay" },
      { name: "description", content: "Withdraw funds using your Student ID." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { account, transactions } = useStore();
  const [amount, setAmount] = useState("");
  const [idInput, setIdInput] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (!idInput) return toast.error("Enter your Student ID");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    try {
      addWithdrawal({ amount: amt, studentId: idInput, note });
      toast.success(`Withdrew ${formatGHS(amt)} — parent notified`);
      setAmount("");
      setNote("");
      setIdInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(account.studentId);
    toast.success("Student ID copied");
  }

  return (
    <div className="min-h-screen">
      <Header tab="student" />
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Wallet card */}
          <section className="md:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>Wallet</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  <ShieldCheck className="h-3 w-3" /> Secured
                </span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Available balance</div>
              <div className="font-display text-4xl font-bold tracking-tight">
                {formatGHS(account.balance)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{account.studentName}</div>

              <div className="mt-5 rounded-xl bg-background/60 p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>Your Student ID</span>
                  <button
                    onClick={copyId}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="mt-1 font-mono text-lg tracking-widest text-primary">
                  {account.studentId}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Use this ID to withdraw or to receive top-ups from your parent.
                </p>
              </div>
            </div>
          </section>

          {/* Withdraw form */}
          <section className="md:col-span-2">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Withdraw funds
            </h2>
            <form
              onSubmit={handleWithdraw}
              className="mt-3 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <label className="text-xs font-medium text-muted-foreground">
                Enter your Student ID
              </label>
              <input
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="SP-XXXX-XXXX"
                className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-3 font-mono uppercase tracking-widest outline-none focus:border-primary"
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
                {[10, 20, 50, 100].map((v) => (
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

              <label className="mt-5 block text-xs font-medium text-muted-foreground">
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Lunch at cafeteria"
                className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-3 outline-none focus:border-primary"
              />

              <button
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying ID…
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" /> Withdraw{" "}
                    {amount ? formatGHS(parseFloat(amount) || 0) : ""}
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Your parent will receive an instant notification.
              </p>
            </form>

            <h2 className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">
              Recent activity
            </h2>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {transactions.map((t) => {
                const isDeposit = t.type === "deposit";
                return (
                  <div key={t.id} className="flex items-center gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isDeposit
                          ? "bg-primary/15 text-primary"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {isDeposit
                          ? `From ${t.parentName} · ${t.method}`
                          : `Withdrawal · ${t.note ?? "wallet"}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString("en-GH")}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-semibold ${
                        isDeposit ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {isDeposit ? "+" : "−"} {formatGHS(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
