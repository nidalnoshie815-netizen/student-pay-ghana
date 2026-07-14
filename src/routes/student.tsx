import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import { useStore } from "@/hooks/use-store";
import { formatGHS } from "@/lib/mock-store";
import { signOut } from "@/lib/guardian-auth";
import { WalletQRCard } from "@/components/WalletQRCard";
import { LogOut, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — StudentPay" },
      { name: "description", content: "View your wallet balance and show your QR code to pay or withdraw." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const user = useRequireRole("student");
  const state = useStore();
  if (!user) return null;

  const linked = user.students?.[0];
  const balance = state.account.studentId === linked?.studentId ? state.account.balance : 0;

  return (
    <div className="min-h-screen pb-16">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <button
          onClick={() => {
            signOut();
            toast.success("Signed out");
          }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold">{user.fullName}</h1>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Wallet balance</p>
            <p className="mt-1 text-4xl font-bold">{formatGHS(balance)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Student ID: <span className="font-mono">{linked?.studentId || "—"}</span> ·{" "}
              {linked?.school || "School not set"}
            </p>
          </div>
        </section>

        {linked?.studentId && (
          <WalletQRCard studentId={linked.studentId} studentName={user.fullName} />
        )}

        <div className="text-center text-xs text-muted-foreground">
          <Link to="/settings" className="hover:text-foreground">Settings</Link>
        </div>
      </main>
    </div>
  );
}
