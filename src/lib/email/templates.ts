import type { EmailTemplate } from "@/lib/types";
import { STORE_PROMISE } from "@/lib/promise";

const KEY = "army-vault-email-templates";

export const DEFAULT_ACCEPTANCE_TEMPLATE: EmailTemplate = {
  id: "acceptance",
  name: "Application Accepted",
  subject: "You're in — {{event}} with {{member}}",
  body: `Hi {{name}},

Great news! Your application for {{event}} ({{format}}) with {{member}} has been accepted.

Event date window: {{date}}

Please reply to confirm your attendance and watch for slot-selection instructions.

Borahae,
ARMY Vault Experiences Team

${STORE_PROMISE}`,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_REJECTION_TEMPLATE: EmailTemplate = {
  id: "rejection",
  name: "Application Not Selected",
  subject: "Update on {{event}}",
  body: `Hi {{name}},

Thank you for applying to {{event}} with {{member}}.

Unfortunately we could not offer you a slot this round. Please stay subscribed for future {{format}} experiences.

Borahae,
ARMY Vault Experiences Team`,
  updatedAt: new Date().toISOString(),
};

function readTemplates(): EmailTemplate[] {
  if (typeof window === "undefined") return [DEFAULT_ACCEPTANCE_TEMPLATE, DEFAULT_REJECTION_TEMPLATE];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const defaults = [DEFAULT_ACCEPTANCE_TEMPLATE, DEFAULT_REJECTION_TEMPLATE];
      localStorage.setItem(KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw) as EmailTemplate[];
  } catch {
    return [DEFAULT_ACCEPTANCE_TEMPLATE, DEFAULT_REJECTION_TEMPLATE];
  }
}

export function listEmailTemplates(): EmailTemplate[] {
  return readTemplates();
}

export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return readTemplates().find((t) => t.id === id);
}

export function saveEmailTemplate(template: EmailTemplate) {
  const all = readTemplates();
  const idx = all.findIndex((t) => t.id === template.id);
  const next = { ...template, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  localStorage.setItem(KEY, JSON.stringify(all));
  return next;
}
