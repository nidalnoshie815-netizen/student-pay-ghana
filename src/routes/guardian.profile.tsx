import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useGuardian } from "@/hooks/use-guardian";
import { updateProfile } from "@/lib/guardian-auth";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guardian/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StudentPay" },
      { name: "description", content: "Edit your guardian profile details." },
    ],
  }),
  component: GuardianProfile,
});

function GuardianProfile() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guardian) {
      navigate({ to: "/guardian/auth" });
      return;
    }
    setFullName(guardian.fullName);
    setPhone(guardian.phone);
    setStudentId(guardian.studentId);
  }, [guardian, navigate]);

  if (!guardian) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      updateProfile({ fullName, phone, studentId });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <Link
          to="/parent"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name, phone, and the linked Student ID.
        </p>

        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="mb-5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={guardian.email}
              disabled
              className="input-field mt-1 cursor-not-allowed opacity-60"
            />
          </div>

          <label className="text-xs font-medium text-muted-foreground">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ama Mensah"
            className="input-field mt-1"
          />

          <label className="mt-5 block text-xs font-medium text-muted-foreground">
            Phone number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+233 ..."
            className="input-field mt-1"
          />

          <label className="mt-5 block text-xs font-medium text-muted-foreground">
            Student ID
          </label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
            placeholder="SP-XXXX-XXXX"
            className="input-field mt-1 font-mono tracking-widest"
          />

          <button
            disabled={saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
