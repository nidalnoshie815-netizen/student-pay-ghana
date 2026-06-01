import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { signIn, signUp, type StudentLink } from "@/lib/guardian-auth";
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guardian/auth")({
  head: () => ({
    meta: [
      { title: "Guardian Sign In — StudentPay" },
      { name: "description", content: "Sign in or create a guardian account to manage your student's wallet." },
    ],
  }),
  component: GuardianAuth,
});

function GuardianAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // signup
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState<StudentLink[]>([
    { studentId: "", school: "" },
  ]);

  function updateStudent(index: number, patch: Partial<StudentLink>) {
    setStudents((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function addStudent() {
    setStudents((prev) => [...prev, { studentId: "", school: "" }]);
  }
  function removeStudent(index: number) {
    setStudents((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("Welcome back");
      } else {
        if (!fullName || !phone) throw new Error("Please fill in all fields");
        const cleaned = students
          .map((s) => ({ studentId: s.studentId.trim(), school: s.school.trim() }))
          .filter((s) => s.studentId.length > 0);
        if (cleaned.length === 0) throw new Error("Add at least one student ID");
        await signUp({ fullName, email, phone, students: cleaned, password });
        toast.success("Account created");
      }
      navigate({ to: "/parent" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </header>

      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-16 md:grid-cols-2 md:items-center">
        <section className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Guardian account
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight">
            Stay in control of every <span className="text-primary">GH₵</span> your student spends.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Register once with your student's ID to manage school fees, meals and supplies.
            Pay easily with any Ghanaian mobile money network and track every cedi.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-1 rounded-full border border-border bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "signin"
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Akosua Mensah"
                    className="input-field"
                    required
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 555 8821"
                    className="input-field"
                    required
                  />
                </Field>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Children ({students.length})
                    </span>
                    <button
                      type="button"
                      onClick={addStudent}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium text-primary hover:bg-background"
                    >
                      <Plus className="h-3 w-3" /> Add child
                    </button>
                  </div>
                  {students.length > 3 && (
                    <p className="text-[11px] text-muted-foreground">
                      Managing more than 3 students? Add each child's ID and school below — there's no limit.
                    </p>
                  )}
                  {students.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-background/40 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Child {i + 1}
                        </span>
                        {students.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStudent(i)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remove child ${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        value={s.studentId}
                        onChange={(e) => updateStudent(i, { studentId: e.target.value.toUpperCase() })}
                        placeholder="Student ID — SP-XXXX-XXXX"
                        className="input-field font-mono tracking-widest"
                        required
                      />
                      <input
                        value={s.school}
                        onChange={(e) => updateStudent(i, { school: e.target.value })}
                        placeholder="School name"
                        className="input-field"
                        required
                      />
                    </div>
                  ))}
                </div>

              </>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input-field"
                required
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field"
                required
                minLength={6}
              />
            </Field>

            {mode === "signin" && (
              <div className="text-right">
                <Link
                  to="/guardian/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create guardian account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
