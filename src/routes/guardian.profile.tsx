import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { useGuardian } from "@/hooks/use-guardian";
import { updateProfileFull, type StudentLink } from "@/lib/guardian-auth";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guardian/profile")({
  head: () => ({
    meta: [
      { title: "Profile — StudentPay" },
      { name: "description", content: "Manage your guardian profile, children and contact details." },
    ],
  }),
  component: GuardianProfile,
});

type FormState = {
  fullName: string;
  phone: string;
  address: string;
  occupation: string;
  dateOfBirth: string;
  emergencyName: string;
  emergencyPhone: string;
  preferredLanguage: string;
  avatarDataUrl: string;
  students: StudentLink[];
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

function GuardianProfile() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const empty: FormState = useMemo(
    () => ({
      fullName: "",
      phone: "",
      address: "",
      occupation: "",
      dateOfBirth: "",
      emergencyName: "",
      emergencyPhone: "",
      preferredLanguage: "English",
      avatarDataUrl: "",
      students: [],
    }),
    [],
  );
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (!guardian) {
      navigate({ to: "/guardian/auth" });
      return;
    }
    setForm({
      fullName: guardian.fullName,
      phone: guardian.phone,
      address: guardian.address || "",
      occupation: guardian.occupation || "",
      dateOfBirth: guardian.dateOfBirth || "",
      emergencyName: guardian.emergencyName || "",
      emergencyPhone: guardian.emergencyPhone || "",
      preferredLanguage: guardian.preferredLanguage || "English",
      avatarDataUrl: guardian.avatarDataUrl || "",
      students:
        guardian.students && guardian.students.length
          ? guardian.students
          : [{ studentId: guardian.studentId, school: "" }],
    });
  }, [guardian, navigate]);

  if (!guardian) return null;

  const completion = (() => {
    const fields = [
      form.fullName,
      form.phone,
      form.address,
      form.occupation,
      form.dateOfBirth,
      form.emergencyName,
      form.emergencyPhone,
      form.avatarDataUrl,
    ];
    const filled = fields.filter((f) => f && f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  })();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateStudent(i: number, patch: Partial<StudentLink>) {
    setForm((f) => ({
      ...f,
      students: f.students.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }
  function addStudent() {
    setForm((f) => ({
      ...f,
      students: [...f.students, { studentId: "", school: "", name: "", grade: "" }],
    }));
  }
  function removeStudent(i: number) {
    setForm((f) => ({ ...f, students: f.students.filter((_, idx) => idx !== i) }));
  }

  function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("avatarDataUrl", String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function cancel() {
    setForm({
      fullName: guardian!.fullName,
      phone: guardian!.phone,
      address: guardian!.address || "",
      occupation: guardian!.occupation || "",
      dateOfBirth: guardian!.dateOfBirth || "",
      emergencyName: guardian!.emergencyName || "",
      emergencyPhone: guardian!.emergencyPhone || "",
      preferredLanguage: guardian!.preferredLanguage || "English",
      avatarDataUrl: guardian!.avatarDataUrl || "",
      students:
        guardian!.students && guardian!.students.length
          ? guardian!.students
          : [{ studentId: guardian!.studentId, school: "" }],
    });
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      updateProfileFull({
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        occupation: form.occupation,
        dateOfBirth: form.dateOfBirth,
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
        preferredLanguage: form.preferredLanguage,
        avatarDataUrl: form.avatarDataUrl,
        students: form.students,
      });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const disabled = !editing;

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <Logo />
        <Link
          to="/parent"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Hero card */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="relative h-28 bg-gradient-primary">
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,white_0%,transparent_40%)]" />
          </div>
          <div className="px-4 pb-6 sm:px-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-muted text-2xl font-bold text-foreground shadow-card sm:h-24 sm:w-24">

                  {form.avatarDataUrl ? (
                    <img src={form.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials(form.fullName || guardian.email)}</span>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow"
                    aria-label="Change avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarPick}
                />
              </div>

              <div className="flex gap-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:scale-[1.02]"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={cancel}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h1 className="font-display text-2xl font-bold">{form.fullName || "Your name"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {guardian.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified guardian
                </span>
                <span>· Member since {new Date(guardian.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Completion */}
            <div className="mt-5 rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Profile completion</span>
                <span className="text-muted-foreground">{completion}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Personal */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Personal information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  disabled={disabled}
                  placeholder="Ama Mensah"
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
              <Field label="Email">
                <input value={guardian.email} disabled className="input-field mt-1 cursor-not-allowed opacity-60" />
              </Field>
              <Field label="Phone number">
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  disabled={disabled}
                  placeholder="+233 ..."
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
              <Field label="Date of birth">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  disabled={disabled}
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
              <Field label="Occupation">
                <input
                  value={form.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  disabled={disabled}
                  placeholder="Teacher, engineer, ..."
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
              <Field label="Preferred language">
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => set("preferredLanguage", e.target.value)}
                  disabled={disabled}
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option>English</option>
                  <option>Twi</option>
                  <option>Ga</option>
                  <option>Ewe</option>
                  <option>French</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Home address">
                  <textarea
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    disabled={disabled}
                    rows={2}
                    placeholder="Street, city, region"
                    className="input-field mt-1 resize-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Emergency contact */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Emergency contact</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name">
                <input
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                  disabled={disabled}
                  placeholder="Spouse, sibling, friend"
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
              <Field label="Contact phone">
                <input
                  value={form.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                  disabled={disabled}
                  placeholder="+233 ..."
                  className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </Field>
            </div>
          </section>

          {/* Children */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Linked children</h2>
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={addStudent}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> Add child
                </button>
              )}
            </div>

            <div className="space-y-3">
              {form.students.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-background/30 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Child {i + 1}
                      {i === 0 && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                          Primary
                        </span>
                      )}
                    </span>
                    {editing && form.students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudent(i)}
                        className="text-destructive/80 hover:text-destructive"
                        aria-label="Remove child"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                      <input
                        value={s.name || ""}
                        onChange={(e) => updateStudent(i, { name: e.target.value })}
                        disabled={disabled}
                        placeholder="Child's full name"
                        className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </Field>
                    <Field label="Student ID">
                      <input
                        value={s.studentId}
                        onChange={(e) => updateStudent(i, { studentId: e.target.value.toUpperCase() })}
                        disabled={disabled}
                        placeholder="SP-XXXX-XXXX"
                        className="input-field mt-1 font-mono tracking-widest disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </Field>
                    <Field label="School">
                      <input
                        value={s.school}
                        onChange={(e) => updateStudent(i, { school: e.target.value })}
                        disabled={disabled}
                        placeholder="School name"
                        className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </Field>
                    <Field label="Grade / class">
                      <input
                        value={s.grade || ""}
                        onChange={(e) => updateStudent(i, { grade: e.target.value })}
                        disabled={disabled}
                        placeholder="JHS 2, SHS 1, ..."
                        className="input-field mt-1 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {editing && (
            <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-2xl border border-border bg-card/90 p-3 shadow-card backdrop-blur">
              <button
                type="button"
                onClick={cancel}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
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
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
