import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";

export function SettingsPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <Logo />
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Settings
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 sm:px-5">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-5">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      {children}
    </div>
  );
}
