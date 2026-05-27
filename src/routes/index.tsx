import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, ShieldCheck, Smartphone, Wallet, Users, Sparkles } from "lucide-react";

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
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
        </nav>
        <Link
          to="/guardian/auth"
          className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
        >
          Guardian sign in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* HERO */}
        <section className="relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI-powered student wallet
            </span>
            <h1 className="mt-5 text-balance font-display text-5xl font-bold leading-[1.05] md:text-6xl">
              Send pocket money.
              <br />
              <span className="text-primary">Skip the worry.</span>
            </h1>
            <p className="mt-5 max-w-md text-balance text-muted-foreground">
              Parents top up using MTN MoMo, Vodafone, Telecel or AirtelTigo. Students withdraw
              instantly with a secure Student ID. Everything in Ghana Cedis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/guardian/auth"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
              >
                I'm a Parent <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Bank-grade security
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Mobile money native
              </div>
            </div>
          </div>

          {/* Visual card */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-10 bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Student wallet
                </span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  ACTIVE
                </span>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="font-display text-4xl font-bold tracking-tight">GH₵ 420.00</div>
              </div>
              <div className="mt-6 rounded-xl bg-background/60 p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Student ID
                </div>
                <div className="mt-1 font-mono text-lg tracking-widest text-primary">
                  SP-7F4K-92AC
                </div>
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {["MTN", "VOD", "TEL", "AT"].map((s, i) => (
                  <div
                    key={s}
                    className="flex h-10 items-center justify-center rounded-lg text-xs font-bold text-black"
                    style={{
                      background: ["#FFCC08", "#E60000", "#E60000", "#005EB8"][i],
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-[10px] text-muted-foreground">
                Accepts all Ghana mobile money
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-border py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              icon={<Wallet className="h-5 w-5" />}
              title="Parent top-ups"
              text="Fund your child's wallet from any Ghanaian mobile money account in seconds."
            />
            <Feature
              icon={<Users className="h-5 w-5" />}
              title="Student ID withdrawal"
              text="Students cash out using a unique secure ID — no card, no hassle."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Live notifications"
              text="Parents see every withdrawal the moment it happens. Full transparency."
            />
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="border-t border-border py-16">
          <h2 className="font-display text-3xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Get a Student ID", "Each student receives a unique secure ID code."],
              ["02", "Parent tops up", "Pay via MTN, Vodafone, Telecel or AirtelTigo in GH₵."],
              ["03", "Student withdraws", "Use the ID to withdraw — parent gets notified."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-mono text-xs text-primary">{n}</div>
                <div className="mt-2 font-display text-lg font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} StudentPay Ghana — Built with care.
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <div className="mt-4 font-display text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
