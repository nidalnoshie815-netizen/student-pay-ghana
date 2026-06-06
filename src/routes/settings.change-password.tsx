import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";
import { useGuardian } from "@/hooks/use-guardian";
import { changePassword } from "@/lib/guardian-auth";

export const Route = createFileRoute("/settings/change-password")({
  head: () => ({
    meta: [{ title: "Change Password — StudentPay" }],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  if (!guardian) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current) {
      toast.error("Enter your current password to continue");
      return;
    }
    if (next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (next === current) {
      toast.error("New password must be different from current password");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell
      title="Change Password"
      subtitle="Re-enter your current password to confirm it's you, then choose a new one (at least 6 characters)."
    >
      <form onSubmit={handleSubmit}>
        <SettingsCard>
          <label className="text-xs font-medium text-muted-foreground">
            Current password <span className="text-destructive">*</span>
          </label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="input-field mt-1"
            autoComplete="current-password"
            placeholder="Required to confirm it's you"
            required
          />
          <label className="mt-4 block text-xs font-medium text-muted-foreground">
            New password
          </label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="input-field mt-1"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <label className="mt-4 block text-xs font-medium text-muted-foreground">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field mt-1"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </SettingsCard>

        <button
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Updating…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" /> Update password
            </>
          )}
        </button>
      </form>
    </SettingsPageShell>
  );
}
