import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, ShieldCheck, Smartphone, Wallet, Users, Sparkles } from "lucide-react";
import studentsBg from "@/assets/ghanaian-students.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentPay — Smart allowance for Ghanaian students" },
      {
        name: "description",
        content:
          "Parents top up. Students withdraw with their Student ID. Powered by MTN MoMo, Vodafone, Telecel and AirtelTigo — in Ghana Cedis.",
      },
      { property: "og:title", content: "StudentPay — Smart allowance for students" },
      {
        property: "og:description",
        content: "AI-powered student wallet. Pay in GHS via mobile money.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-page background */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: `url(${studentsBg})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-background/75 via-background/55 to-background/75" aria-hidden="true" />

      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" aria-hidden="true" />

      <header className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:flex sm:justify-between sm:px-6 sm:py-6">
        <Logo />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
        </nav>
        <Link
          to="/guardian/auth"
          className="shrink-0 rounded-full bg-gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:scale-105 sm:px-4 sm:text-sm"
        >
          Guardian sign in
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* HERO */}
        <section className="flex flex-col items-center justify-center py-12 text-center sm:py-20 md:py-28">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0" /> AI-powered student wallet
          </span>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-[clamp(2rem,7vw,3.75rem)] font-bold leading-[1.05] sm:text-5xl md:text-6xl">
            Send pocket money.{" "}
            <span className="text-primary">Skip the worry.</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Support your child's education with seamless mobile money payments for fees,
            meals and daily needs. Students access funds securely with their Student ID — all in Ghana Cedis.
          </p>
          <div className="mt-9 flex w-full flex-wrap justify-center gap-3">
            <Link
              to="/guardian/auth"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition hover:scale-105 sm:w-auto"
            >
              I'm a Parent <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground sm:mt-14 sm:text-base">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" /> Bank-grade security
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 shrink-0 text-primary" /> Mobile money native
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative border-t border-border py-10 sm:py-16">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <Feature
              icon={<Wallet className="h-6 w-6" />}
              title="Parent top-ups"
              text="Fund your child's wallet from any Ghanaian mobile money account in seconds."
            />
            <Feature
              icon={<Users className="h-6 w-6" />}
              title="Student ID withdrawal"
              text="Students cash out using a unique secure ID — no card, no hassle."
            />
            <Feature
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Live notifications"
              text="Parents see every withdrawal the moment it happens. Full transparency."
            />
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="relative border-t border-border py-10 sm:py-16">
          <h2 className="text-center font-display text-[clamp(1.5rem,5vw,2.25rem)] font-bold sm:text-3xl md:text-4xl">How it works</h2>
          <ol className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
            {[
              ["01", "Get a Student ID", "Each student receives a unique secure ID code."],
              ["02", "Parent tops up", "Pay via MTN, Vodafone, Telecel or AirtelTigo in GH₵."],
              ["03", "Student withdraws", "Use the ID to withdraw — parent gets notified."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm sm:p-6">
                <div className="font-mono text-sm text-primary sm:text-base">{n}</div>
                <div className="mt-2 font-display text-xl font-semibold sm:text-2xl">{t}</div>
                <div className="mt-1 text-base leading-relaxed text-muted-foreground sm:text-lg">{d}</div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="relative mx-auto max-w-6xl px-4 py-10 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} StudentPay Ghana — Built with care.
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm transition hover:border-primary/50 sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="mt-4 font-display text-xl font-semibold sm:text-2xl">{title}</div>
      <div className="mt-1 text-base leading-relaxed text-muted-foreground sm:text-lg">{text}</div>
    </div>
  );
}
