import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useGuardian } from "@/hooks/use-guardian";
import { BottomNav } from "@/components/BottomNav";

type Provider = "mtn" | "telecel" | "airteltigo";

const providers: { id: Provider; name: string; short: string; bg: string; fg: string }[] = [
  { id: "mtn", name: "MTN Mobile Money", short: "MTN", bg: "var(--brand-mtn)", fg: "var(--brand-mtn-fg)" },
  { id: "telecel", name: "Telecel Cash", short: "TEL", bg: "var(--brand-telecel)", fg: "var(--brand-telecel-fg)" },
  { id: "airteltigo", name: "AirtelTigo Money", short: "AT", bg: "var(--brand-airteltigo)", fg: "var(--brand-airteltigo-fg)" },
];

export const Route = createFileRoute("/add-money")({
  head: () => ({
    meta: [
      { title: "Add Money — StudentPay" },
      { name: "description", content: "Fund the student wallet with mobile money." },
    ],
  }),
  component: AddMoneyPage,
});

function AddMoneyPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [provider, setProvider] = useState<Provider>("mtn");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  if (!guardian) return null;

  function handleContinue() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    const to =
      provider === "mtn"
        ? "/add-money/mtn"
        : provider === "telecel"
          ? "/add-money/telecel"
          : "/add-money/airteltigo";
    navigate({ to, search: { amount: amt } });
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/parent" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="mt-4 font-display text-2xl font-bold">Add Money</h1>
        <p className="text-sm text-muted-foreground">
          Choose a payment method to fund the wallet.
        </p>

        <section className="mt-5">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            Payment method
          </h2>
          <div className="mt-2 space-y-2">
            {providers.map((p) => {
              const active = provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: p.bg, color: p.fg }}
                  >
                    {p.short}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Mobile Money</div>
                  </div>
                  {active ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            Amount
          </h2>
          <div className="relative mt-2">
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
          <div className="mt-2 flex flex-wrap gap-2">
            {[20, 50, 100, 200, 500].map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs hover:border-primary"
              >
                GH₵ {v}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleContinue}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01]"
        >
          Continue
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure payments powered by Student Pay
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
