import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

export const Route = createFileRoute("/settings/help")({
  head: () => ({ meta: [{ title: "Help Center — StudentPay" }] }),
  component: HelpCenterPage,
});

const faqs = [
  {
    q: "How do I top up my child's wallet?",
    a: "Go to Home → Fund Wallet, choose MTN, Telecel or AirtelTigo, enter the amount and authorize on your phone.",
  },
  {
    q: "How does my child withdraw money?",
    a: "Your child presents their Student ID at any campus POS. A withdrawal alert is sent to you instantly.",
  },
  {
    q: "What if I forget my password?",
    a: "Use 'Forgot password' on the sign-in screen — we'll send a 6-digit code to reset it.",
  },
  {
    q: "Can I link more than one child?",
    a: "Yes. In Settings → School Information you can add multiple children, each with their own Student ID and school.",
  },
  {
    q: "Are payments secure?",
    a: "All payments are processed through MTN, Telecel and AirtelTigo's official channels. Your PIN is required on your own device.",
  },
];

function HelpCenterPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SettingsPageShell title="Help Center" subtitle="Answers to common questions.">
      <SettingsCard>
        <ul className="divide-y divide-border">
          {faqs.map((f, i) => (
            <li key={i} className="py-3">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left text-sm font-medium"
              >
                {f.q}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i ? (
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </SettingsCard>
    </SettingsPageShell>
  );
}
