import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — StudentPay" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SettingsPageShell title="Privacy Policy" subtitle="How we handle your data.">
      <SettingsCard>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            StudentPay collects only the data we need to deliver the service: your name, email,
            phone number, your child's Student ID and school, and a history of your transactions.
          </p>
          <h2 className="text-foreground font-semibold">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details (name, email, phone)</li>
            <li>Linked student information (Student ID, school)</li>
            <li>Transaction history (top-ups, withdrawals, transfers)</li>
            <li>Device data for fraud prevention</li>
          </ul>
          <h2 className="text-foreground font-semibold">How we use it</h2>
          <p>
            To process payments, send alerts to guardians, prevent fraud, and improve the
            product. We never sell your personal information.
          </p>
          <h2 className="text-foreground font-semibold">Sharing</h2>
          <p>
            We share data only with payment partners (MTN, Telecel, AirtelTigo) as required to
            complete transactions, and with regulators where the law requires it.
          </p>
          <h2 className="text-foreground font-semibold">Your rights</h2>
          <p>
            You can request a copy of your data or ask us to delete your account at any time by
            contacting support@studentpay.gh.
          </p>
        </div>
      </SettingsCard>
    </SettingsPageShell>
  );
}
