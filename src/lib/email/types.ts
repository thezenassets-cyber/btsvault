export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  meta?: Record<string, string>;
};

export type EmailSendResult = {
  ok: boolean;
  mode: "demo" | "resend";
  id: string;
  error?: string;
};

export const EMAIL_TEMPLATE_VARS = [
  "{{name}}",
  "{{member}}",
  "{{event}}",
  "{{format}}",
  "{{date}}",
] as const;
