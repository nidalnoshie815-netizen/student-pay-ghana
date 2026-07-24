import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PAYSTACK_BASE = "https://api.paystack.co";

const initInput = z.object({
  email: z.string().email(),
  amount: z.number().positive(), // GHS
  provider: z.enum(["mtn", "vod", "atl"]),
  phone: z.string().min(9),
  callbackUrl: z.string().url(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const initializePaystack = createServerFn({ method: "POST" })
  .inputValidator(initInput)
  .handler(async ({ data }) => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const body = {
      email: data.email,
      amount: Math.round(data.amount * 100), // pesewas
      currency: "GHS",
      callback_url: data.callbackUrl,
      channels: ["mobile_money", "card"],
      mobile_money: {
        phone: data.phone.replace(/\D/g, ""),
        provider: data.provider,
      },
      metadata: data.metadata ?? {},
    };

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new Error(json.message || `Paystack init failed (${res.status})`);
    }
    return json.data;
  });

export const verifyPaystack = createServerFn({ method: "POST" })
  .inputValidator(z.object({ reference: z.string().min(3) }))
  .handler(async ({ data }) => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: {
        status: string; // "success" | "failed" | "abandoned"
        reference: string;
        amount: number; // pesewas
        currency: string;
        channel: string;
        paid_at: string | null;
        metadata: Record<string, unknown> | null;
        customer: { email: string };
      };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new Error(json.message || `Paystack verify failed (${res.status})`);
    }
    return {
      status: json.data.status,
      reference: json.data.reference,
      amount: json.data.amount / 100,
      currency: json.data.currency,
      channel: json.data.channel,
      paidAt: json.data.paid_at,
      metadata: json.data.metadata ?? {},
      email: json.data.customer.email,
    };
  });
