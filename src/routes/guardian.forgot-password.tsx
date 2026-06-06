import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { requestPasswordReset, resetPassword } from "@/lib/guardian-auth";
import { Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
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

type Step = "request" | "reset";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { code: issuedCode } = requestPasswordReset(email);
      // Mock email delivery — surface the code in a toast so the user can
      // complete the flow without a backend.
      toast.success("Reset code sent", {
        description: `Your 6-digit code is ${issuedCode} (mock email — valid 10 minutes)`,
        duration: 12000,
      });
      setStep("reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset code");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      toast.success("Password updated. You can sign in now.");
      navigate({ to: "/guardian/auth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      const { code: issuedCode } = requestPasswordReset(email);
      toast.success("New code sent", {
        description: `Your 6-digit code is ${issuedCode}`,
        duration: 12000,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend code");
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
            We'll send a 6-digit code to your email. Enter it on the next screen and choose a new
            password — your student's wallet stays safe the whole time.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <StepDot active={step === "request"}>1</StepDot>
              <div>
                <div className="font-medium text-foreground">Enter your email</div>
                <div>We'll send a one-time code.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <StepDot active={step === "reset"}>2</StepDot>
              <div>
                <div className="font-medium text-foreground">Verify & choose password</div>
                <div>Set a new password and sign back in.</div>
              </div>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Send reset code</div>
                  <div className="text-xs text-muted-foreground">
                    We'll email a 6-digit code valid for 10 minutes.
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
                Send code
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link to="/guardian/auth" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Set new password</div>
                  <div className="text-xs text-muted-foreground">
                    Code sent to <span className="text-foreground">{email}</span>
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">6-digit code</span>
                <input
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="input-field mt-1 text-center font-mono text-lg tracking-[0.5em]"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field mt-1"
                  required
                  minLength={6}
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="input-field mt-1"
                  required
                  minLength={6}
                />
              </label>

              <button
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Update password
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Use a different email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary hover:underline"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function StepDot({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
        active
          ? "bg-gradient-primary text-primary-foreground shadow-glow"
          : "border border-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
