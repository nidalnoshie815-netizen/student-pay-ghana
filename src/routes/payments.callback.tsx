import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { verifyPaystack } from "@/lib/paystack.functions";
import { addDeposit, formatGHS, type PaymentMethod } from "@/lib/mock-store";
import { useGuardian } from "@/hooks/use-guardian";
import { useStore } from "@/hooks/use-store";

const search = z.object({
  reference: z.string().optional(),
  trxref: z.string().optional(),
});

export const Route = createFileRoute("/payments/callback")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Payment status — StudentPay" }] }),
  component: PaymentCallback,
});

type State = "verifying" | "success" | "failed";

function PaymentCallback() {
  const { reference, trxref } = Route.useSearch();
  const ref = reference || trxref;
  const navigate = useNavigate();
  const guardian = useGuardian();
  const { account } = useStore();
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState("Verifying your payment…");
  const [amount, setAmount] = useState<number | null>(null);
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    if (!ref) {
      setState("failed");
      setMessage("Missing payment reference.");
      return;
    }
    (async () => {
      try {
        const result = (await verifyPaystack({ data: { reference: ref } })) as {
          status: string;
          amount: number;
          metadata: Record<string, string | number | boolean | null>;
        };
        if (result.status === "success") {
          const method = (result.metadata?.method as PaymentMethod) || "MTN MoMo";
          const studentId =
            (result.metadata?.studentId as string) || account.studentId;
          try {
            addDeposit({
              amount: result.amount,
              method,
              studentId,
              parentName: guardian?.fullName ?? "Guardian",
            });
          } catch (e) {
            // Non-fatal: payment succeeded even if local ledger update failed.
            console.error(e);
          }
          setAmount(result.amount);
          setState("success");
          setMessage(`${formatGHS(result.amount)} added to wallet.`);
          toast.success("Payment successful");
        } else {
          setState("failed");
          setMessage(`Payment ${result.status}.`);
        }
      } catch (err) {
        setState("failed");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    })();
  }, [ref, account.studentId, guardian?.fullName]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      {state === "verifying" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-4 font-display text-xl font-semibold">{message}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please don't close this page.
          </p>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Payment successful</h1>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {amount !== null && (
            <div className="mt-4 rounded-2xl border border-border bg-card px-6 py-4 text-3xl font-bold">
              {formatGHS(amount)}
            </div>
          )}
          <button
            onClick={() => navigate({ to: "/parent" })}
            className="mt-6 w-full rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow"
          >
            Back to dashboard
          </button>
        </>
      )}
      {state === "failed" && (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Payment failed</h1>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <button
            onClick={() => navigate({ to: "/add-money" })}
            className="mt-6 w-full rounded-xl border border-border bg-card py-3 font-semibold"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
