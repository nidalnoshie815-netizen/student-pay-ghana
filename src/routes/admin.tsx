import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useRequireRole } from "@/lib/roles";
import {
  listAllUsers,
  setUserSuspended,
  signOut,
  type Guardian,
} from "@/lib/guardian-auth";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { useStore } from "@/hooks/use-store";
import { formatGHS } from "@/lib/mock-store";
import { LogOut, ShieldCheck, Users, ShieldAlert, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — StudentPay" },
      { name: "description", content: "Platform admin: users, transactions, and moderation." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const user = useRequireRole("admin");
  const store = useStore();
  const [users, setUsers] = useState<Guardian[]>([]);

  async function refresh() {
    try {
      setUsers(await listAllUsers());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users");
    }
  }

  useEffect(() => {
    if (user) void refresh();
  }, [user]);

  if (!user) return null;

  const byRole = (r: Role) => users.filter((u) => (u.role || "parent") === r).length;
  const txVolume = store.transactions.reduce((s, t) => s + t.amount, 0);


  return (
    <div className="min-h-screen pb-16">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        <button
          onClick={async () => { await signOut(); toast.success("Signed out"); }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>


      <main className="mx-auto max-w-5xl px-6 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Platform admin</p>
              <h1 className="text-lg font-semibold">{user.fullName}</h1>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Parents" value={byRole("parent")} />
            <Stat label="Students" value={byRole("student")} />
            <Stat label="Vendors" value={byRole("vendor")} />
            <Stat label="Volume" value={formatGHS(txVolume)} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Users ({users.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email} · {ROLE_LABEL[(u.role || "parent") as Role]}
                    {u.suspended ? " · Suspended" : ""}
                  </p>
                </div>
                {u.role !== "admin" && (
                  <button
                    onClick={async () => {
                      try {
                        await setUserSuspended(u.id, !u.suspended);
                        await refresh();
                        toast.success(u.suspended ? "User reactivated" : "User suspended");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed");
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${
                      u.suspended
                        ? "border-primary/40 text-primary hover:bg-primary/10"
                        : "border-destructive/40 text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {u.suspended ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                    {u.suspended ? "Reactivate" : "Suspend"}
                  </button>
                )}
              </div>

            ))}
            {users.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No users yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Recent transactions</h2>
          </div>
          <div className="divide-y divide-border">
            {store.transactions.slice(0, 12).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{t.category} · {t.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={t.type === "deposit" ? "text-primary" : "text-foreground"}>
                  {t.type === "deposit" ? "+" : "-"}{formatGHS(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
