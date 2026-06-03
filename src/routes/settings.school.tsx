import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";
import { useGuardian } from "@/hooks/use-guardian";
import { updateStudents, type StudentLink } from "@/lib/guardian-auth";

export const Route = createFileRoute("/settings/school")({
  head: () => ({
    meta: [
      { title: "School Information — StudentPay" },
      { name: "description", content: "Manage your linked students and their schools." },
    ],
  }),
  component: SchoolInfoPage,
});

function SchoolInfoPage() {
  const navigate = useNavigate();
  const guardian = useGuardian();
  const [students, setStudents] = useState<StudentLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guardian) {
      navigate({ to: "/guardian/auth" });
      return;
    }
    setStudents(
      guardian.students?.length
        ? guardian.students
        : [{ studentId: guardian.studentId, school: "" }],
    );
  }, [guardian, navigate]);

  if (!guardian) return null;

  const update = (i: number, patch: Partial<StudentLink>) =>
    setStudents((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const add = () => setStudents((arr) => [...arr, { studentId: "", school: "" }]);
  const remove = (i: number) =>
    setStudents((arr) => (arr.length === 1 ? arr : arr.filter((_, idx) => idx !== i)));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      updateStudents(students);
      toast.success("School information updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPageShell
      title="School Information"
      subtitle="Schools and Student IDs linked to your account."
    >
      <form onSubmit={handleSave}>
        <SettingsCard>
          <div className="space-y-4">
            {students.map((s, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Child {i + 1}
                  </span>
                  {students.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <label className="mt-3 block text-xs font-medium text-muted-foreground">
                  Student ID
                </label>
                <input
                  value={s.studentId}
                  onChange={(e) => update(i, { studentId: e.target.value.toUpperCase() })}
                  placeholder="SP-XXXX-XXXX"
                  className="input-field mt-1 font-mono tracking-widest"
                />
                <label className="mt-3 block text-xs font-medium text-muted-foreground">
                  School
                </label>
                <input
                  value={s.school}
                  onChange={(e) => update(i, { school: e.target.value })}
                  placeholder="e.g. University of Ghana"
                  className="input-field mt-1"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={add}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add child
          </button>
        </SettingsCard>

        <button
          disabled={saving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
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
    </SettingsPageShell>
  );
}
