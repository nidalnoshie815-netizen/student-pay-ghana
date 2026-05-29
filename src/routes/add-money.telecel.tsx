import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProviderPayForm } from "@/components/ProviderPayForm";
import { BottomNav } from "@/components/BottomNav";

const search = z.object({ amount: z.number().optional() });

export const Route = createFileRoute("/add-money/telecel")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "Telecel Cash — StudentPay" }],
  }),
  component: TelecelPage,
});

function TelecelPage() {
  const { amount } = Route.useSearch();
  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <ProviderPayForm
        initialAmount={amount ? String(amount) : ""}
        config={{
          method: "Telecel Cash",
          name: "Telecel Cash",
          short: "TEL",
          bg: "var(--brand-telecel)",
          fg: "var(--brand-telecel-fg)",
          numberLabel: "Telecel Number",
          numberPlaceholder: "020 000 0000",
        }}
      />
      <BottomNav />
    </div>
  );
}
