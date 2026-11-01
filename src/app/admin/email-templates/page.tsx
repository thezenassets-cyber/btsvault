"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  listEmailTemplates,
  saveEmailTemplate,
} from "@/lib/email/templates";
import { EMAIL_TEMPLATE_VARS } from "@/lib/email/types";
import { renderTemplate } from "@/lib/email/send";
import type { EmailTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PREVIEW_VARS = {
  name: "Kim ARMY",
  member: "Jungkook",
  event: "ARIRANG In-Person Meet & Greet",
  format: "In Person",
  date: "April 12, 2026",
};

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeId, setActiveId] = useState("acceptance");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = listEmailTemplates();
    setTemplates(list);
    const t = list.find((x) => x.id === activeId) ?? list[0];
    if (t) {
      setActiveId(t.id);
      setSubject(t.subject);
      setBody(t.body);
    }
  }, [activeId]);

  function select(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setActiveId(id);
    setSubject(t.subject);
    setBody(t.body);
    setSaved(false);
  }

  function save() {
    const next = saveEmailTemplate({
      id: activeId,
      name: templates.find((t) => t.id === activeId)?.name ?? activeId,
      subject,
      body,
      updatedAt: new Date().toISOString(),
    });
    setTemplates(listEmailTemplates());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    return next;
  }

  return (
    <AdminShell title="Email templates">
      <div className="mb-4 flex flex-wrap gap-2">
        {EMAIL_TEMPLATE_VARS.map((v) => (
          <Badge key={v} variant="muted">
            {v}
          </Badge>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => select(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              activeId === t.id ? "bg-purple-main text-white" : "bg-white/5 text-cream/60"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-cream/50">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-cream/50">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream"
            />
          </div>
          <Button onClick={save}>{saved ? "Saved ✓" : "Save template"}</Button>
          <p className="text-xs text-cream/40">
            Demo storage in localStorage. Set RESEND_API_KEY server-side to enable live send seam.
          </p>
        </div>
        <div className="rounded-2xl glass p-6">
          <p className="text-xs font-medium tracking-wider text-cream/50 uppercase">Preview</p>
          <p className="mt-3 text-lg font-semibold text-cream">
            {renderTemplate(subject, PREVIEW_VARS)}
          </p>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-cream/60">
            {renderTemplate(body, PREVIEW_VARS)}
          </pre>
        </div>
      </div>
    </AdminShell>
  );
}
