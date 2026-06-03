import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

const LANG_KEY = "studentpay_language_v1";
const languages = [
  { code: "en", label: "English" },
  { code: "tw", label: "Twi" },
  { code: "ga", label: "Ga" },
  { code: "ee", label: "Ewe" },
  { code: "fr", label: "Français" },
] as const;

export const Route = createFileRoute("/settings/language")({
  head: () => ({ meta: [{ title: "Language — StudentPay" }] }),
  component: LanguagePage,
});

function LanguagePage() {
  const [selected, setSelected] = useState<string>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSelected(localStorage.getItem(LANG_KEY) || "en");
  }, []);

  const pick = (code: string, label: string) => {
    setSelected(code);
    localStorage.setItem(LANG_KEY, code);
    toast.success(`Language set to ${label}`);
  };

  return (
    <SettingsPageShell title="Language" subtitle="Choose your preferred language.">
      <SettingsCard>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Languages className="h-4 w-4" />
          App language
        </div>
        <ul className="mt-3 divide-y divide-border">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => pick(l.code, l.label)}
                className="flex w-full items-center justify-between py-3 text-left text-sm"
              >
                <span>{l.label}</span>
                {selected === l.code ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </SettingsCard>
    </SettingsPageShell>
  );
}
