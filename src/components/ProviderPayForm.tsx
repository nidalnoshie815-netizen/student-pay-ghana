import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { addDeposit, formatGHS, type PaymentMethod } from "@/lib/mock-store";
import { useGuardian } from "@/hooks/use-guardian";
import { useStore } from "@/hooks/use-store";

export interface ProviderConfig {
  method: PaymentMethod;
  name: string;
  short: string;
  bg: string;
  fg: string;
  numberLabel: string;
  numberPlaceholder: string;
}

export function ProviderPayForm({
  config,
  initialAmount,
}: {
  config: ProviderConfig;
  initialAmount?: string;
}) {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { account } = useStore();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(initialAmount ?? "");
  const [loading, setLoading] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (phone.replace(/\D/g, "").length < 9) return toast.error("Enter a valid phone");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    try {
      addDeposit({
        amount: amt,
        method: config.method,
        studentId: account.studentId,
        parentName: guardian?.fullName ?? "Guardian",
      });
      toast.success(`${formatGHS(amt)} added via ${config.name}`);
      navigate({ to: "/parent" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-6">
      <button
        type="button"
        onClick={() => navigate({ to: "/add-money" })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div
        className="flex items-center gap-3 rounded-2xl p-5"
        style={{ background: config.bg, color: config.fg }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/15 font-bold"
        >
          {config.short}
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">{config.name}</h1>
          <div className="text-xs opacity-80">Mobile Money</div>
        </div>
      </div>

      <form
        onSubmit={handlePay}
        className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <label className="text-xs font-medium text-muted-foreground">
          {config.numberLabel}
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={config.numberPlaceholder}
          inputMode="tel"
          className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-3 font-mono tracking-wide outline-none focus:border-primary"
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

        <p className="mt-5 rounded-xl bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
          You will receive a prompt on your phone. Please enter your MoMo PIN to
          authorize.
        </p>

        <button
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
          style={{ background: config.bg, color: config.fg }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for prompt…
            </>
          ) : (
            <>Pay Now</>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure payments powered by Student Pay
        </div>
      </form>
    </div>
  );
}
