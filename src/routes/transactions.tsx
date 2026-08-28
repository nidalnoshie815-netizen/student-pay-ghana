import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useGuardian } from "@/hooks/use-guardian";
import { useStore } from "@/hooks/use-store";
import { formatGHS, type Transaction } from "@/lib/mock-store";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — StudentPay" }] }),
  component: TransactionsPage,
});

type Filter = "all" | "deposit" | "withdrawal";

function TransactionsPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { transactions } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  if (!guardian) return null;

  const list = transactions.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="relative min-h-screen pb-24">
      <div className="mx-auto max-w-md px-4 sm:px-5 pt-6">
        <Link to="/parent" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">Transactions</h1>

        <div className="mt-4 flex gap-2">
          {(["all", "deposit", "withdrawal"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                filter === f
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {f === "all" ? "All" : f === "deposit" ? "Funding" : "Outflow"}
            </button>
          ))}
        </div>

        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {list.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No transactions
            </div>
          )}
          {list.map((t) => (
            <TxRow key={t.id} tx={t} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit";
  const category = tx.category ?? (isDeposit ? "Wallet Funding" : "Vendor Payment");
  return (
    <div className="flex items-center gap-3 p-3.5 sm:p-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          isDeposit ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
        }`}
      >
        {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{category}</div>
        <div className="truncate text-[11px] text-muted-foreground sm:text-xs">
          {tx.note ?? tx.method ?? "—"} · {timeAgo(tx.createdAt)}
        </div>
      </div>
      <div
        className={`shrink-0 font-mono text-[13px] font-semibold sm:text-sm ${
          isDeposit ? "text-primary" : "text-foreground"
        }`}
      >
        {isDeposit ? "+" : "−"} {formatGHS(tx.amount)}
      </div>
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
