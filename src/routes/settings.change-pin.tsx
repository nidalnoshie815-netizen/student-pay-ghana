import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";
import { useGuardian } from "@/hooks/use-guardian";
import { changePin, getPin } from "@/lib/guardian-auth";

export const Route = createFileRoute("/settings/change-pin")({
  head: () => ({
    meta: [{ title: "Change PIN — StudentPay" }],
  }),
  component: ChangePinPage,
});

function ChangePinPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const hasPin = !!getPin();
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
    if (next.length !== 4 || !/^\d{4}$/.test(next)) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (next !== confirm) {
      toast.error("PINs do not match");
      return;
    }
    setSaving(true);
    try {
      await changePin({ currentPin: hasPin ? current : undefined, newPin: next });
      toast.success(hasPin ? "PIN changed" : "PIN set");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update PIN");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell
      title={hasPin ? "Change PIN" : "Set PIN"}
      subtitle="Your 4-digit PIN authorizes payments and withdrawals."
    >
      <form onSubmit={handleSubmit}>
        <SettingsCard>
          {hasPin ? (
            <>
              <label className="text-xs font-medium text-muted-foreground">Current PIN</label>
              <input
                inputMode="numeric"
                maxLength={4}
                value={current}
                onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ""))}
                className="input-field mt-1 text-center font-mono tracking-[0.6em]"
              />
            </>
          ) : null}
          <label className={`${hasPin ? "mt-4" : ""} block text-xs font-medium text-muted-foreground`}>
            New PIN
          </label>
          <input
            inputMode="numeric"
            maxLength={4}
            value={next}
            onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))}
            className="input-field mt-1 text-center font-mono tracking-[0.6em]"
          />
          <label className="mt-4 block text-xs font-medium text-muted-foreground">Confirm PIN</label>
          <input
            inputMode="numeric"
            maxLength={4}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
            className="input-field mt-1 text-center font-mono tracking-[0.6em]"
          />
        </SettingsCard>

        <button
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> {hasPin ? "Update PIN" : "Set PIN"}
            </>
          )}
        </button>
      </form>
    </SettingsPageShell>
  );
}
