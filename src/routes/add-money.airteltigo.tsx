import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProviderPayForm } from "@/components/ProviderPayForm";
import { BottomNav } from "@/components/BottomNav";

const search = z.object({ amount: z.number().optional() });

export const Route = createFileRoute("/add-money/airteltigo")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "AirtelTigo Money — StudentPay" }],
  }),
  component: AirtelTigoPage,
});

function AirtelTigoPage() {
  const { amount } = Route.useSearch();
  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <ProviderPayForm
        initialAmount={amount ? String(amount) : ""}
        config={{
          method: "AirtelTigo Money",
          name: "AirtelTigo Money",
          short: "AT",
          bg: "var(--brand-airteltigo)",
          fg: "var(--brand-airteltigo-fg)",
          numberLabel: "AirtelTigo Number",
          numberPlaceholder: "027 000 0000",
        }}
      />
      <BottomNav />
    </div>
  );
}
