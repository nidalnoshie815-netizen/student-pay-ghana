import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Receipt, Sparkles, Settings, User } from "lucide-react";

const leftItems = [
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/insights", label: "Insights", icon: Sparkles },
] as const;

const rightItems = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/guardian/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-end justify-between gap-1 px-2 pt-2 sm:px-4">
        {leftItems.map((it) => (
          <NavItem key={it.to} {...it} active={pathname === it.to} />
        ))}

        <Link
          to="/parent"
          aria-label="Home"
          className={`-mt-7 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow ring-4 ring-background ${
            pathname === "/parent" ? "scale-105" : ""
          }`}
        >
          <Home className="h-6 w-6" />
        </Link>

        {rightItems.map((it) => (
          <NavItem key={it.to} {...it} active={pathname === it.to} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors sm:w-16 sm:flex-none ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="w-full truncate text-center">{label}</span>
    </Link>
  );
}
