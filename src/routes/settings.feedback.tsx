import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Star } from "lucide-react";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";

export const Route = createFileRoute("/settings/feedback")({
  head: () => ({ meta: [{ title: "Send Feedback — StudentPay" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please type a message");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setMessage("");
    setRating(0);
    toast.success("Thanks for the feedback!");
  }

  return (
    <SettingsPageShell
      title="Send Feedback"
      subtitle="Tell us what's working and what isn't."
    >
      <form onSubmit={submit}>
        <SettingsCard>
          <label className="text-xs font-medium text-muted-foreground">Rate your experience</label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
              >
                <Star
                  className={`h-7 w-7 ${
                    n <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <label className="mt-5 block text-xs font-medium text-muted-foreground">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="input-field mt-1 resize-none"
            placeholder="Share your thoughts…"
          />
        </SettingsCard>

        <button
          disabled={sending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send feedback
            </>
          )}
        </button>
      </form>
    </SettingsPageShell>
  );
}
