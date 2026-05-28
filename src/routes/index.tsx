import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, ShieldCheck, Smartphone, Wallet, Users, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import studentsImg from "@/assets/ghanaian-students.jpg";

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

          {/* Ghanaian students hero visual on gradient */}
          <div className="relative flex min-h-[420px] items-center justify-center">
            <div className="absolute inset-0 bg-gradient-primary opacity-30 blur-3xl" />
            <div className="absolute right-6 top-6 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute bottom-6 left-6 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />

            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-primary opacity-60 blur-xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-primary/40 bg-card shadow-glow">
                <img
                  src={studentsImg}
                  alt="Ghanaian students studying together with books and smartphones"
                  width={1024}
                  height={1024}
                  className="h-[420px] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

                {/* Floating educational badges */}
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                  <GraduationCap className="h-3.5 w-3.5" /> For Ghanaian students
                </div>
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Learn. Earn. Spend smart.
                </div>
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
