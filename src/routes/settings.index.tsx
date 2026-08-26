import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { useGuardian } from "@/hooks/use-guardian";
import { signOut } from "@/lib/guardian-auth";
import {
  User,
  IdCard,
  School,
  Lock,
  KeyRound,
  Fingerprint,
  Bell,
  BellRing,
  Sparkles,
  Moon,
  Languages,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  FileText,
  ShieldCheck,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — StudentPay" },
      { name: "description", content: "Manage your StudentPay account, security and preferences." },
    ],
  }),
  component: SettingsPage,
});

type RowProps = {
  icon: typeof User;
  label: string;
  to?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

function Row({ icon: Icon, label, to, right, onClick, danger }: RowProps) {
  const content = (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        danger ? "text-destructive" : "text-foreground"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          danger ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="mr-1.5">{emoji}</span>
        {title}
      </h2>
      <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [txAlerts, setTxAlerts] = useState(true);
  const [parentAlerts, setParentAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    if (!guardian) navigate({ to: "/guardian/auth" });
  }, [guardian, navigate]);

  if (!guardian) return null;


  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <Logo />
        <span className="text-xs text-muted-foreground">Settings</span>
      </header>

      <main className="mx-auto max-w-md px-4 sm:px-5">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, security and preferences.
        </p>

        <Section title="Account" emoji="👤">
          <Row icon={User} label="Edit Profile" to="/guardian/profile" />
          <Row icon={IdCard} label="Student ID" to="/guardian/profile" />
          <Row icon={School} label="School Information" to="/settings/school" />
        </Section>

        <Section title="Security" emoji="🔒">
          <Row icon={Lock} label="Change Password" to="/settings/change-password" />
          <Row icon={KeyRound} label="Change PIN" to="/settings/change-pin" />
          <Row
            icon={Fingerprint}
            label="Biometric Login"
            right={<Toggle checked={biometric} onChange={setBiometric} />}
          />
        </Section>

        <Section title="Notifications" emoji="🔔">
          <Row
            icon={Bell}
            label="Transaction Alerts"
            right={<Toggle checked={txAlerts} onChange={setTxAlerts} />}
          />
          <Row
            icon={BellRing}
            label="Parent Notifications"
            right={<Toggle checked={parentAlerts} onChange={setParentAlerts} />}
          />
          <Row
            icon={Sparkles}
            label="AI Spending Alerts"
            right={<Toggle checked={aiAlerts} onChange={setAiAlerts} />}
          />
        </Section>

        <Section title="Preferences" emoji="🌙">
          <Row
            icon={Moon}
            label="Dark Mode"
            right={<Toggle checked={darkMode} onChange={setDarkMode} />}
          />
          <Row
            icon={Languages}
            label="Language"
            to="/settings/language"
            right={<span className="text-xs text-muted-foreground">English</span>}
          />
        </Section>

        <Section title="Help & Support" emoji="❓">
          <Row icon={HelpCircle} label="Help Center" to="/settings/help" />
          <Row icon={LifeBuoy} label="Contact Support" to="/settings/contact" />
          <Row icon={MessageSquare} label="Send Feedback" to="/settings/feedback" />
        </Section>

        <Section title="About" emoji="📜">
          <Row icon={FileText} label="Terms & Conditions" to="/settings/terms" />
          <Row icon={ShieldCheck} label="Privacy Policy" to="/settings/privacy" />
          <Row icon={Info} label="App Version" right={<span className="text-xs text-muted-foreground">1.0.0</span>} />
        </Section>


        <Section title="Account" emoji="🚪">
          <Row
            icon={LogOut}
            label="Logout"
            danger
            onClick={() => {
              signOut();
              toast.success("Signed out");
              navigate({ to: "/" });
            }}
          />
        </Section>
      </main>

      <BottomNav />
    </div>
  );
}
