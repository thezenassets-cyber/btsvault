import type { EmailPayload, EmailSendResult } from "@/lib/email/types";

const OUTBOUND_KEY = "army-vault-email-log";

function logOutbound(entry: EmailPayload & { id: string; mode: string; at: string }) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(OUTBOUND_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(OUTBOUND_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

export function getEmailLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OUTBOUND_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Demo send now; when RESEND_API_KEY is present server-side, swap to Resend.
 * Client always uses demo path — server route can call Resend later.
 */
export async function sendApplicationEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Resend-ready stub (mirrors Stripe checkout pattern)
  if (typeof process !== "undefined" && process.env.RESEND_API_KEY) {
    // Server-only path would POST to https://api.resend.com/emails
    // Keeping demo behavior until wired with a from-domain.
    logOutbound({ ...payload, id, mode: "resend-stub", at: new Date().toISOString() });
    return { ok: true, mode: "resend", id };
  }

  logOutbound({ ...payload, id, mode: "demo", at: new Date().toISOString() });
  return { ok: true, mode: "demo", id };
}

export function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}
