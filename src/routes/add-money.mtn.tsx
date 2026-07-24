import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProviderPayForm } from "@/components/ProviderPayForm";
import { BottomNav } from "@/components/BottomNav";

const search = z.object({ amount: z.number().optional() });

export const Route = createFileRoute("/add-money/mtn")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "MTN Mobile Money — StudentPay" }],
  }),
  component: MtnPage,
});

function MtnPage() {
  const { amount } = Route.useSearch();
  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <ProviderPayForm
        initialAmount={amount ? String(amount) : ""}
        config={{
          method: "MTN MoMo",
          name: "MTN Mobile Money",
          short: "MTN",
          bg: "var(--brand-mtn)",
          fg: "var(--brand-mtn-fg)",
          numberLabel: "MTN Number",
          numberPlaceholder: "024 000 0000",
          paystackProvider: "mtn",
        }}
      />
      <BottomNav />
    </div>
  );
}
