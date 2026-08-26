import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useGuardian } from "@/hooks/use-guardian";
import { useStore } from "@/hooks/use-store";
import { generateAIAlerts, type AlertLevel } from "@/lib/ai-alerts";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights — StudentPay" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { account, transactions } = useStore();

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  const alerts = useMemo(
    () => generateAIAlerts(account, transactions),
    [account, transactions],
  );

  if (!guardian) return null;

  return (
    <div className="relative min-h-screen pb-24">
      <div className="mx-auto max-w-md px-4 sm:px-5 pt-6">
        <Link to="/parent" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold">AI Insights</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Live, personalized alerts on {account.studentName}'s wallet activity.
        </p>

        <div className="mt-5 space-y-3">
          {alerts.map((a) => (
            <AlertCard key={a.id} level={a.level} title={a.title} emoji={a.emoji} message={a.message} />
          ))}
        </div>
      </div>
      <BottomNav />
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
    <div className={`rounded-2xl border p-4 ${styles[level]}`}>
      <div className="text-sm font-semibold">
        <span className="mr-1.5">{emoji}</span>
        {title}
      </div>
      <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{message}</div>
    </div>
  );
}
