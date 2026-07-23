import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { requestPasswordReset } from "@/lib/guardian-auth";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guardian/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — StudentPay" },
      { name: "description", content: "Reset your StudentPay guardian password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success("Check your inbox", {
        description: "We've sent a password reset link to your email.",
        duration: 8000,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/guardian/auth" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to sign in
        </Link>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-16 md:grid-cols-2 md:items-center">
        <section className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Account recovery
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight">
            Forgot your password?
            <br />
            <span className="text-primary">No worries.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter your email and we'll send a secure link to reset your password.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Check your inbox</div>
                  <div className="text-xs text-muted-foreground">
                    We sent a reset link to <span className="text-foreground">{email}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to choose a new password. The link expires shortly for
                your security.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-primary hover:underline"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Send reset link</div>
                  <div className="text-xs text-muted-foreground">
                    We'll email a secure link to reset your password.
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-field mt-1"
                  required
                />
              </label>

              <button
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send reset link
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link to="/guardian/auth" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
