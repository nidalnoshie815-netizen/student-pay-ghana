import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

export const Route = createFileRoute("/settings/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — StudentPay" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SettingsPageShell title="Terms & Conditions" subtitle="Last updated June 2026.">
      <SettingsCard>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            By using StudentPay you agree to these terms. StudentPay is a wallet service that
            connects parents and students in Ghana, allowing top-ups via MTN MoMo, Telecel Cash
            and AirtelTigo Money, and on-campus withdrawals via Student ID.
          </p>
          <h2 className="text-foreground font-semibold">1. Eligibility</h2>
          <p>
            You must be at least 18 years old to open a guardian account. Student accounts are
            opened on behalf of a minor by their guardian.
          </p>
          <h2 className="text-foreground font-semibold">2. Wallet balances</h2>
          <p>
            Funds in your wallet are held in Ghana Cedis. StudentPay is not a bank and does not
            pay interest on balances. You may withdraw available funds at any time.
          </p>
          <h2 className="text-foreground font-semibold">3. Acceptable use</h2>
          <p>
            You agree not to use StudentPay for any unlawful purpose, including fraud, money
            laundering, or the financing of restricted goods.
          </p>
          <h2 className="text-foreground font-semibold">4. Fees</h2>
          <p>
            Top-ups and withdrawals may be subject to mobile-money operator fees. StudentPay
            displays the applicable fee before each transaction.
          </p>
          <h2 className="text-foreground font-semibold">5. Liability</h2>
          <p>
            StudentPay is provided "as is". To the maximum extent permitted by law we exclude
            any liability for indirect or consequential loss.
          </p>
        </div>
      </SettingsCard>
    </SettingsPageShell>
  );
}
