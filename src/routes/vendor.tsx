import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import { addWithdrawal, formatGHS, getState } from "@/lib/mock-store";
import { signOut } from "@/lib/guardian-auth";
import { useStore } from "@/hooks/use-store";
import { LogOut, Store, ScanLine } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — StudentPay" },
      { name: "description", content: "Charge students using their StudentPay ID and track collections." },
    ],
  }),
  component: VendorDashboard,
});

function VendorDashboard() {
  const user = useRequireRole("vendor");
  const state = useStore();
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const collected = state.transactions
    .filter((t) => t.type === "withdrawal" && t.category === "Vendor Payment" && t.note?.startsWith(user.businessName ?? ""))
    .reduce((sum, t) => sum + t.amount, 0);

  async function handleCharge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      addWithdrawal({
        amount: amt,
        studentId: studentId.trim(),
        note: `${user!.businessName ?? "Vendor"}${note ? " — " + note : ""}`,
        category: "Vendor Payment",
      });
      toast.success(`Charged ${formatGHS(amt)}`);
      setAmount(""); setNote(""); setStudentId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Charge failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <button
          onClick={() => { signOut(); toast.success("Signed out"); }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <h1 className="text-lg font-semibold">{user.businessName || user.fullName}</h1>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total collected</p>
            <p className="mt-1 text-4xl font-bold">{formatGHS(collected)}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Charge a student</h2>
          </div>
          <form onSubmit={handleCharge} className="space-y-3">
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="Student ID — SP-XXXX-XXXX"
              className="input-field font-mono tracking-widest"
              required
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (GHS)"
              className="input-field"
              required
              min="1"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="input-field"
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {loading ? "Processing…" : "Charge"}
            </button>
          </form>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Tip: use a QR scanner (student shows their code) to auto-fill the Student ID.
          </p>
        </section>
      </main>
    </div>
  );
}
