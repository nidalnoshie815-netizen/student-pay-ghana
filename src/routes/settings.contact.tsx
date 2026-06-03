import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

export const Route = createFileRoute("/settings/contact")({
  head: () => ({ meta: [{ title: "Contact Support — StudentPay" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SettingsPageShell
      title="Contact Support"
      subtitle="We're here Mon–Sat, 8am – 8pm GMT."
    >
      <SettingsCard>
        <ul className="divide-y divide-border">
          <li className="py-3">
            <a href="mailto:support@studentpay.gh" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">Email</div>
                <div className="text-xs text-muted-foreground">support@studentpay.gh</div>
              </div>
            </a>
          </li>
          <li className="py-3">
            <a href="tel:+233200000000" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">Phone</div>
                <div className="text-xs text-muted-foreground">+233 20 000 0000</div>
              </div>
            </a>
          </li>
          <li className="py-3">
            <a
              href="https://wa.me/233200000000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Chat with an agent</div>
              </div>
            </a>
          </li>
        </ul>
      </SettingsCard>
    </SettingsPageShell>
  );
}
