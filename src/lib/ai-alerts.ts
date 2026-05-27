import type { StudentAccount, Transaction } from "@/lib/mock-store";
import { formatGHS } from "@/lib/mock-store";

export type AlertLevel = "info" | "success" | "warning" | "critical";

export interface AIAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  emoji: string;
  createdAt: number;
}

const DAY = 86400000;

export function generateAIAlerts(
  account: StudentAccount,
  transactions: Transaction[],
): AIAlert[] {
  const now = Date.now();
  const alerts: AIAlert[] = [];
  const withdrawals = transactions.filter((t) => t.type === "withdrawal");
  const deposits = transactions.filter((t) => t.type === "deposit");

  // Low balance
  if (account.balance < 50) {
    alerts.push({
      id: "low-balance",
      level: "critical",
      title: "Low balance warning",
      emoji: "⚠️",
      message: `${account.studentName}'s wallet is down to ${formatGHS(
        account.balance,
      )}. Consider topping up soon.`,
      createdAt: now,
    });
  } else if (account.balance < 150) {
    alerts.push({
      id: "balance-watch",
      level: "warning",
      title: "Balance running low",
      emoji: "🔔",
      message: `Only ${formatGHS(account.balance)} left. AI suggests a top-up of around ${formatGHS(
        suggestedTopUp(transactions),
      )} based on weekly spend.`,
      createdAt: now,
    });
  }

  // Spending velocity (last 24h)
  const last24h = withdrawals.filter((t) => now - t.createdAt < DAY);
  const last24Sum = last24h.reduce((s, t) => s + t.amount, 0);
  if (last24Sum > 200) {
    alerts.push({
      id: "spike",
      level: "warning",
      title: "Unusual spending detected",
      emoji: "📈",
      message: `${formatGHS(last24Sum)} withdrawn in the last 24 hours — above the typical daily pattern.`,
      createdAt: now,
    });
  }

  // Frequent withdrawals
  if (last24h.length >= 3) {
    alerts.push({
      id: "frequent",
      level: "info",
      title: "Frequent withdrawals",
      emoji: "🔁",
      message: `${last24h.length} withdrawals today. Tap "Lock card" if this seems suspicious.`,
      createdAt: now,
    });
  }

  // Weekly insight
  const last7d = transactions.filter((t) => now - t.createdAt < 7 * DAY);
  const wkOut = last7d.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const wkIn = last7d.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  if (last7d.length > 0) {
    alerts.push({
      id: "weekly",
      level: "info",
      title: "Weekly summary",
      emoji: "🧠",
      message: `This week: +${formatGHS(wkIn)} in, −${formatGHS(wkOut)} out. ${
        wkOut > wkIn
          ? "Outflow exceeds top-ups."
          : "On track with healthy balance."
      }`,
      createdAt: now,
    });
  }

  // No top-up in a while
  const lastDeposit = deposits[0];
  if (lastDeposit && now - lastDeposit.createdAt > 5 * DAY) {
    alerts.push({
      id: "stale-topup",
      level: "info",
      title: "Top-up reminder",
      emoji: "💸",
      message: `Last top-up was ${Math.floor((now - lastDeposit.createdAt) / DAY)} days ago via ${
        lastDeposit.method
      }.`,
      createdAt: now,
    });
  }

  // Encouraging note
  if (alerts.length === 0) {
    alerts.push({
      id: "all-good",
      level: "success",
      title: "All clear",
      emoji: "✅",
      message: `${account.studentName}'s wallet looks healthy. AI is monitoring 24/7.`,
      createdAt: now,
    });
  }

  return alerts;
}

function suggestedTopUp(transactions: Transaction[]) {
  const now = Date.now();
  const week = transactions.filter(
    (t) => t.type === "withdrawal" && now - t.createdAt < 7 * DAY,
  );
  const sum = week.reduce((s, t) => s + t.amount, 0);
  const avg = sum || 200;
  return Math.ceil(avg / 50) * 50;
}
