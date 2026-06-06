import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SettingsPageShell, SettingsCard } from "@/components/SettingsPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askHelpAI } from "@/lib/help-ai.functions";

export const Route = createFileRoute("/settings/help")({
  head: () => ({ meta: [{ title: "Help Center — StudentPay" }] }),
  component: HelpCenterPage,
});

const faqs = [
  {
    q: "How do I top up my child's wallet?",
    a: "Go to Home → Fund Wallet, choose MTN, Telecel or AirtelTigo, enter the amount and authorize on your phone.",
  },
  {
    q: "How does my child withdraw money?",
    a: "Your child presents their Student ID at any campus POS. A withdrawal alert is sent to you instantly.",
  },
  {
    q: "What if I forget my password?",
    a: "Use 'Forgot password' on the sign-in screen — we'll send a 6-digit code to reset it.",
  },
  {
    q: "Can I link more than one child?",
    a: "Yes. In Settings → School Information you can add multiple children, each with their own Student ID and school.",
  },
  {
    q: "Are payments secure?",
    a: "All payments are processed through MTN, Telecel and AirtelTigo's official channels. Your PIN is required on your own device.",
  },
];

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I add another child?",
  "Why was my top-up declined?",
  "How do I change my PIN?",
];

function HelpCenterPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your StudentPay AI assistant. Ask me anything about top-ups, withdrawals, or your account.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askHelpAI);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reach assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPageShell title="Help Center" subtitle="Answers to common questions.">
      <SettingsCard>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Help Assistant</p>
            <p className="text-xs text-muted-foreground">Get instant answers, 24/7</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border bg-background/50 p-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          ) : null}
        </div>

        {messages.length <= 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={loading}
            maxLength={500}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SettingsCard>

      <div className="mt-5">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Frequently asked
        </h2>
        <SettingsCard>
          <ul className="divide-y divide-border">
            {faqs.map((f, i) => (
              <li key={i} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium"
                >
                  {f.q}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      open === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open === i ? (
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </SettingsCard>
      </div>
    </SettingsPageShell>
  );
}
