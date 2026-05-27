import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/mock-store";
import { Check } from "lucide-react";

export function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_METHODS.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
              active
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm text-black"
              style={{ background: m.color }}
            >
              {m.short}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{m.id}</div>
              <div className="text-xs text-muted-foreground">Mobile Money</div>
            </div>
            {active && <Check className="h-4 w-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
