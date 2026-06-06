import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are the StudentPay Help Assistant — a friendly, concise support agent for a Ghanaian student wallet app used by parents/guardians.

Key product facts:
- Parents fund their child's wallet via MTN MoMo, Telecel Cash, or AirtelTigo Money.
- Children withdraw by presenting their Student ID at any campus POS.
- Guardians receive instant alerts for top-ups and withdrawals.
- Settings include: School Information (link multiple children), Change Password, Change PIN, Language, Privacy, Contact Support.
- For forgotten passwords, users tap "Forgot password" on sign-in and get a 6-digit code.
- Payments are processed via official mobile-money channels; PIN is entered on the user's own phone.

Rules:
- Keep answers under 4 short sentences unless the user asks for detail.
- Use plain language; avoid jargon.
- If you don't know, suggest "Contact Support" from Settings.
- Never invent fees, phone numbers, or policies.`;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

export const askHelpAI = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z.array(MessageSchema).min(1).max(20),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    if (res.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to your workspace.");
    }
    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error:", res.status, text);
      throw new Error("AI assistant is unavailable. Please try again later.");
    }

    const json = await res.json();
    const reply: string =
      json.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    return { reply };
  });
