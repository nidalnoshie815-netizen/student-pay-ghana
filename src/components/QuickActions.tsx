import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, Receipt, Sparkles } from "lucide-react";

export function QuickActions() {
  const items = [
    {
      label: "Fund Wallet",
      icon: ArrowDownToLine,
      to: "/add-money" as const,
      tone: "bg-primary/15 text-primary",
    },
    {
      label: "Transactions",
      icon: Receipt,
      to: "/transactions" as const,
      tone: "bg-accent/20 text-accent-foreground",
    },
    {
      label: "AI Insights",
      icon: Sparkles,
      to: "/insights" as const,
      tone: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((it) => {
        const Inner = (
          <>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${it.tone}`}
            >
              <it.icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {it.label}
            </span>
          </>
        );
        const cls =
          "flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition hover:border-primary/50 hover:shadow-card";
        return (
          <Link key={it.label} to={it.to} className={cls}>
            {Inner}
          </Link>
        );
      })}
    </div>
  );
}
